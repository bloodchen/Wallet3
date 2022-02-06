import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { formatAddress, formatCurrency } from '../../utils/formatter';
import { numericFontFamily, themeColor } from '../../constants/styles';

import AnimateNumber from 'react-native-animate-number';
import ColorLogos from '../../assets/icons/networks/color';
import CopyableText from '../../components/CopyableText';
import { INetwork } from '../../common/Networks';
import Image from 'react-native-expo-cached-image';
import Langs from '../../viewmodels/settings/Langs';
import React from 'react';
import Ripple from 'react-native-material-ripple';
import WhiteLogos from '../../assets/icons/networks/white';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  style?: StyleProp<ViewStyle>;
  balance?: number;
  currency?: string;
  network?: INetwork;
  connectedApps?: number;
  address?: string;
  ens?: string;
  avatar?: string;
  chainId: number;
  disabled?: boolean;
  separatorColor?: string;
  separatorWidth?: number;
  textColor: string;
  onSendPress?: () => void;
  onRequestPress?: () => void;
  onDAppsPress?: () => void;
  mode?: 'light' | 'dark';
  gasPrice?: number;
}

export default observer(
  ({
    style,
    address,
    balance,
    network,
    avatar,
    chainId,
    connectedApps,
    currency,
    onSendPress,
    onRequestPress,
    onDAppsPress,
    disabled,
    separatorColor,
    separatorWidth,
    textColor,
    mode,
    gasPrice,
  }: Props) => {
    const { t } = i18n;

    const prefixedAddress = network?.addrPrefix ? `${network?.addrPrefix}${address?.substring(2)}` : address;

    return (
      <View style={{ ...styles.container, ...((style as any) || {}) }}>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 4,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => PubSub.publish('openNetworksMenu')}
            >
              <Text style={{ ...styles.text, fontSize: 16, color: textColor }}>{network?.network}</Text>
              <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 2 }} color={textColor} size={12} />
            </TouchableOpacity>

            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 100,
                  marginHorizontal: 8,
                  borderWidth: 1,
                  borderColor: '#ffffff90',
                }}
              />
            ) : undefined}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: 15 }}>
              <AnimateNumber
                value={gasPrice || 0}
                style={{ ...styles.text, color: textColor, marginEnd: 4 }}
                numberOfLines={1}
                formatter={(v) => `${v.toFixed(2)} Gwei`}
              />
              <MaterialIcons name="local-gas-station" size={17} color={textColor} />
            </View>

            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onDAppsPress}>
              <Text style={{ ...styles.text, color: textColor, fontSize: 14, marginEnd: 5, opacity: connectedApps || 0 }}>
                {connectedApps}
              </Text>
              <Feather name="layers" size={14} color={textColor} style={{ opacity: connectedApps || 0 }} />
            </TouchableOpacity>
          </View>
        </View>

        <CopyableText
          copyText={prefixedAddress || ''}
          title={formatAddress(prefixedAddress || '', 6 + (network?.addrPrefix?.length ?? 0), 5)}
          iconSize={10}
          iconColor={textColor}
          iconStyle={{ marginHorizontal: 5 }}
          txtStyle={{ ...styles.text, fontSize: 12, color: textColor }}
        />

        <View style={{ height: 36, backgroundColor: 'transparent' }} />

        <View style={{ justifyContent: 'space-between', marginBottom: 8, height: 32, position: 'relative' }}>
          <Text style={{ ...styles.headline, position: 'relative', opacity: 0 }} numberOfLines={1}>
            [Placeholder] DO NOT DELETE ME!!!
          </Text>

          <AnimateNumber
            value={balance || 0}
            style={{ ...styles.headline, color: textColor }}
            numberOfLines={1}
            formatter={(v) => formatCurrency(v, currency)}
          />

          {mode === 'light' ? WhiteLogos[chainId] : ColorLogos[chainId]}
        </View>

        <View
          style={{
            height: separatorWidth ?? 1,
            backgroundColor: separatorColor ?? '#ffffff25',
            marginTop: 2,
            marginHorizontal: -12,
          }}
        />

        <View style={styles.buttonsContainer}>
          <Ripple
            style={styles.button}
            rippleColor={mode === 'light' ? undefined : themeColor}
            onPress={(_) => (disabled ? undefined : onSendPress?.())}
          >
            <Ionicons name="md-arrow-up-circle-outline" size={18} color={textColor} />
            <Text style={{ ...styles.buttonText, color: textColor }}>{t('button-send')}</Text>
          </Ripple>
          <View style={{ width: separatorWidth ?? 1, backgroundColor: separatorColor ?? '#ffffff25' }}></View>

          <Ripple
            style={styles.button}
            rippleColor={mode === 'light' ? undefined : themeColor}
            onPress={(_) => (disabled ? undefined : onRequestPress?.())}
          >
            <Ionicons name="md-arrow-down-circle-outline" size={18} color={textColor} />
            <Text style={{ ...styles.buttonText, color: textColor }}>{t('button-request')}</Text>
          </Ripple>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingBottom: 0,
    paddingHorizontal: 12,
    backgroundColor: themeColor,
    overflow: 'hidden',
  },

  text: { color: 'white', fontWeight: '500' },

  headline: {
    color: 'white',
    fontWeight: '600',
    maxWidth: '85%',
    fontSize: 29,
    textAlignVertical: 'bottom',
    lineHeight: 33,
    position: 'absolute',
    bottom: -8,
  },

  buttonsContainer: {
    flexDirection: 'row',
    marginHorizontal: -12,
    position: 'relative',
  },

  button: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    marginStart: 6,
    fontSize: 16,
    fontWeight: '500',
  },
});
