import React, { useEffect, useState } from 'react';

import AddressQRCode from './AddressQRCode';
import App from '../../viewmodels/core/App';
import Assets from './Assets';
import CurrencyViewmodel from '../../viewmodels/settings/Currency';
import { DrawerScreenProps } from '@react-navigation/drawer';
import GasPrice from '../../viewmodels/misc/GasPrice';
import { IToken } from '../../common/tokens';
import { InappBrowserModal } from '../Modalize';
import MessageKeys from '../../common/MessageKeys';
import Networks from '../../viewmodels/core/Networks';
import Overview from './Overview';
import { Portal } from 'react-native-portalize';
import SquircleModalize from '../../modals/core/SquircleModalize';
import Theme from '../../viewmodels/settings/Theme';
import TokenDetail from './TokenDetail';
import Transaction from '../../models/entities/Transaction';
import TxDetail from './TxDetail';
import { View } from 'react-native';
import WalletConnectHub from '../../viewmodels/walletconnect/WalletConnectHub';
import { isAndroid } from '../../utils/platform';
import { logScreenView } from '../../viewmodels/services/Analytics';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ConnectedDapps: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { currentAccount } = App;
  const { current } = Networks;
  const { ref: tokenDetailModalize, open: openTokenDetail, close: closeTokenDetail } = useModalize();
  const { ref: txDetailModalize, open: openTxDetail, close: closeTxDetail } = useModalize();
  const { ref: addressQRModalize, open: openAddressQR } = useModalize();
  const [selectedToken, setSelectedToken] = useState<IToken>();
  const [selectedTx, setSelectedTx] = useState<Transaction>();
  const { backgroundColor, isLightMode, mode } = Theme;

  const onTokenPress = (token: IToken) => {
    setSelectedToken(token);
    setTimeout(() => openTokenDetail(), 0);
  };

  const onTxPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setTimeout(() => openTxDetail(), 10);
    logScreenView('TxDetail');
  };

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openMyAddressQRCode, () => openAddressQR());

    return () => {
      PubSub.unsubscribe(MessageKeys.openMyAddressQRCode);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        paddingBottom: 0,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor,
      }}
    >
      <Overview
        mode={mode}
        style={{
          backgroundColor: isLightMode ? current.color : 'transparent',
          marginBottom: 2,
          borderWidth: isLightMode ? 0 : 1,
          borderColor: current.color,
        }}
        separatorColor={isLightMode ? undefined : current.color}
        textColor={isLightMode ? '#fff' : current.color}
        address={currentAccount?.address}
        balance={currentAccount?.balance}
        currency={CurrencyViewmodel.currentCurrency.symbol}
        network={current}
        chainId={current.chainId}
        avatar={currentAccount?.avatar}
        ens={currentAccount?.ens.name}
        connectedApps={WalletConnectHub.connectedCount}
        disabled={currentAccount?.tokens.loadingTokens}
        onSendPress={() => PubSub.publish(MessageKeys.openSendFundsModal)}
        onRequestPress={() => PubSub.publish(MessageKeys.openRequestFundsModal)}
        onDAppsPress={() => navigation.navigate('ConnectedDapps')}
        gasPrice={GasPrice.currentGwei}
        onQRCodePress={() => openAddressQR()}
        signInPlatform={currentAccount?.signInPlatform}
      />

      <Assets
        tokens={currentAccount?.tokens.tokens}
        themeColor={current.color}
        loadingTokens={currentAccount?.tokens.loadingTokens}
        onRefreshRequest={async () => await App.refreshAccount()}
        onTokenPress={onTokenPress}
        onTxPress={onTxPress}
        network={current}
      />

      <Portal>
        <SquircleModalize ref={tokenDetailModalize}>
          <TokenDetail
            token={selectedToken}
            network={current}
            themeColor={current.color}
            onSendPress={(token) => {
              PubSub.publish(MessageKeys.openSendFundsModal, { token });
              closeTokenDetail();
            }}
          />
        </SquircleModalize>

        <SquircleModalize ref={txDetailModalize}>
          <TxDetail tx={selectedTx} close={closeTxDetail} />
        </SquircleModalize>

        <SquircleModalize ref={addressQRModalize}>
          <AddressQRCode account={currentAccount || undefined} />
        </SquircleModalize>

        <InappBrowserModal pageKey="wallet" />
      </Portal>
    </View>
  );
});
