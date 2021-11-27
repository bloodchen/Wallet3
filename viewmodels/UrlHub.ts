import * as Linking from 'expo-linking';

import i18n from '../i18n';
import { showMessage } from 'react-native-flash-message';

class UrlHub {
  private lastHandled = 0;

  start() {
    console.log(
      Linking.parse(
        'wallet3://wc?uri=wc%3A445aee77-4115-47d1-8d05-3f2abb88ebd7%401%3Fbridge%3Dhttps%253A%252F%252Fw.bridge.walletconnect.org%26key%3Da3f9fd25769a0339692d1eca55268942ec7c11f65c76a8348eee9f2b0db09af0'
      )
    );

    Linking.getInitialURL().then((url) => this.handleURL(url!));
    Linking.addEventListener('url', ({ url }) => this.handleURL(url));
  }

  handleURL = (url: string) => {
    if (!url) return false;
    
    const appSchemes = ['wallet3:', 'ledgerlive', 'dharma', 'huobiwallet', 'imtokenv2', 'tpoutside'];
    const supportedSchemes = ['ethereum', 'wc:', '0x'].concat(appSchemes);
    const scheme =
      supportedSchemes.find((schema) => url.toLowerCase().startsWith(schema)) || (url.endsWith('.eth') ? '0x' : undefined);

    if (!scheme) {
      if (Date.now() - this.lastHandled < 3000) return false;

      showMessage({ message: i18n.t('msg-invalid-qr-code'), type: 'warning' });
      this.lastHandled = Date.now();
      return false;
    }

    if (appSchemes.includes(scheme)) {
      try {
        const { queryParams } = Linking.parse(url);
        PubSub.publish(`CodeScan-wc:`, { data: queryParams.uri });
      } catch (error) {}
    } else {
      PubSub.publish(`CodeScan-${scheme}`, { data: url.replace('Ethereum', 'ethereum') });
    }

    return true;
  };
}

export default new UrlHub();
