import React, { useState } from 'react';

import Authentication from '../../viewmodels/auth/Authentication';
import { InpageDAppSignRequest } from '../../screens/browser/controller/InpageDAppController';
import Networks from '../../viewmodels/core/Networks';
import Sign from '../compositions/Sign';
import Success from '../views/Success';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props extends InpageDAppSignRequest {
  close: () => void;
}

export default observer(({ msg, type, chainId, typedData, approve, reject, close, account, metadata }: Props) => {
  const [verified, setVerified] = useState(false);
  const [themeColor] = useState(Networks.find(chainId)?.color ?? Networks.Ethereum.color);
  const { bottom } = useSafeAreaInsets();

  const onReject = () => {
    reject();
    close();
  };

  const onApprove = async (opt?: { pin?: string; standardMode?: boolean }) => {
    const result = await approve(opt);
    setVerified(result);
    if (result) setTimeout(() => close(), 1750);
    return result;
  };

  return (
    <View style={{ height: styles.safeArea.height + (typedData ? bottom : 0), flex: 1 }}>
      {verified ? (
        <Success />
      ) : (
        <Sign
          msg={msg}
          type={type}
          themeColor={themeColor}
          onReject={onReject}
          onSign={onApprove}
          sign={onApprove}
          typedData={typedData}
          biometricType={Authentication.biometricType}
          account={account}
          metadata={metadata}
        />
      )}
    </View>
  );
});
