import React, { useState } from 'react';
import { Text, View } from 'react-native';

import Authentication from '../../../viewmodels/auth/Authentication';
import BackableScrollTitles from '../../../modals/components/BackableScrollTitles';
import { ButtonV2 } from '../../../components';
import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import { FadeInDownView } from '../../../components/animations';
import IllustrationAsk from '../../../assets/illustrations/misc/ask.svg';
import { Ionicons } from '@expo/vector-icons';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { PairedDevice } from '../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../viewmodels/tss/management/PairedDevices';
import QRCode from 'react-native-qrcode-svg';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { openGlobalPasspad } from '../../../common/Modals';
import { sleep } from '../../../utils/async';
import { startLayoutAnimation } from '../../../utils/animations';
import { useOptimizedSafeBottom } from '../../../utils/hardware';
import { warningColor } from '../../../constants/styles';

export const DeviceOverview = ({
  deviceInfo,
  createdAt,
  lastUsedAt,
  onNext,
  buttonTitle,
}: {
  deviceInfo: ClientInfo;
  buttonTitle?: string;
  createdAt?: string;
  lastUsedAt?: string;
  onNext: () => void;
}) => {
  const { secondaryTextColor } = Theme;
  const { t } = i18n;
  const safeBottom = useOptimizedSafeBottom();

  return (
    <FadeInDownView style={{ flex: 1 }} delay={300}>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Device deviceId={deviceInfo.device} os={deviceInfo!.rn_os!} style={{ width: 108, height: 150 }} />
        <Text style={{ marginTop: 16, fontWeight: '500', color: secondaryTextColor }}>
          {`${deviceInfo.name}, ${deviceInfo.os} ${deviceInfo.osVersion}`}
        </Text>

        <Text
          style={{ marginTop: 12, fontWeight: '500', color: secondaryTextColor, fontSize: 12, textTransform: 'capitalize' }}
        >
          {`${t(createdAt ? 'multi-sig-modal-txt-created-time' : 'multi-sig-modal-txt-last-used-time')}: ${
            createdAt || lastUsedAt
          }`}
        </Text>
      </View>

      <FadeInDownView delay={400}>
        <ButtonV2
          title={buttonTitle ?? t('button-view-secret')}
          style={{ marginBottom: safeBottom }}
          onPress={onNext}
          icon={() => <Ionicons name="lock-closed" color="#fff" size={16} />}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
};

export const SecretView = ({ secret, device, onNext }: { secret: string; device: PairedDevice; onNext: () => void }) => {
  const safeBottom = useOptimizedSafeBottom();
  const { secondaryTextColor, textColor, appColor, borderColor } = Theme;
  const { t } = i18n;

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <QRCode
          value={secret}
          size={150}
          color={textColor}
          enableLinearGradient
          linearGradient={['rgb(134, 65, 244)', 'rgb(66, 194, 244)']}
          backgroundColor="transparent"
        />

        <Text style={{ color: appColor, marginVertical: 16, fontWeight: '500' }}>
          {`${t('multi-sig-modal-txt-threshold')}: ${device.threshold} of n`}
        </Text>

        <Text style={{ maxWidth: 200, textAlign: 'center', color: secondaryTextColor, fontWeight: '500' }}>
          {t('multi-sig-modal-msg-restore-from-shard-qr-code')}
        </Text>
      </View>

      <FadeInDownView delay={200}>
        <ButtonV2
          style={{ marginBottom: safeBottom }}
          themeColor={warningColor}
          title={t('button-remove')}
          onPress={onNext}
          icon={() => <Ionicons name="trash" color={'#fff'} size={16} />}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
};

export const DeleteView = ({
  message,
  onDone,
  textAlign,
}: {
  onDone: () => void;
  message?: string;
  textAlign?: 'center' | 'auto';
}) => {
  const safeBottom = useOptimizedSafeBottom();
  const { t } = i18n;
  const { secondaryTextColor, textColor, appColor } = Theme;

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <IllustrationAsk width={150} height={150} />
        <Text style={{ maxWidth: 270, textAlign: textAlign ?? 'center', marginVertical: 24, color: textColor }}>
          {message ?? t('multi-sig-modal-msg-delete-device')}
        </Text>
      </View>

      <FadeInDownView delay={300}>
        <ButtonV2
          onPress={onDone}
          themeColor={warningColor}
          style={{ marginBottom: safeBottom }}
          title={t('button-confirm')}
          icon={() => <Ionicons name="trash" color={'#fff'} size={16} />}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
};

export default ({ device, close }: { device: PairedDevice; close: () => void }) => {
  const { t } = i18n;
  const [step, setStep] = useState(0);
  const { textColor } = Theme;
  const [secret, setSecret] = useState('');

  const goTo = async (step: number, delay = 0) => {
    if (delay) await sleep(delay);
    setStep(step);
  };

  const authAndNext = async () => {
    let success = false;

    const autoAuth = async (pin?: string) => {
      try {
        const secret = await Authentication.decryptForever(device.encryptedRootShard, pin);
        success = secret ? true : false;
        if (success) setSecret(secret!);
        return success;
      } catch (error) {
        return false;
      }
    };

    await openGlobalPasspad({ fast: true, onAutoAuthRequest: autoAuth, onPinEntered: autoAuth, closeOnOverlayTap: true });

    if (success) goTo(1);
  };

  const doDelete = () => {
    setTimeout(() => {
      PairedDevices.removeDevice(device);
      startLayoutAnimation();
    }, 500);

    close();
  };

  return (
    <ModalRootContainer>
      <BackableScrollTitles
        currentIndex={step}
        showBack={step > 0}
        onBackPress={() => goTo(step - 1)}
        iconColor={textColor}
        titles={[
          t('multi-sig-screen-paired-device'),
          t('multi-sig-modal-title-secret-key'),
          t('multi-sig-modal-title-delete-secret-key'),
        ]}
      />

      {step === 0 && <DeviceOverview deviceInfo={device.deviceInfo} createdAt={device.createdAt} onNext={authAndNext} />}
      {step === 1 && <SecretView device={device} secret={secret} onNext={() => goTo(2)} />}
      {step === 2 && <DeleteView onDone={doDelete} />}
    </ModalRootContainer>
  );
};
