import { action, makeObservable, observable, runInAction } from 'mobx';
import { convertAlchemyToNfts, convertBounceToNfts, convertOpenseaAssetsToNft } from '../services/NftTransformer';
import { getAlchemyNFTs, getCenterNFTs } from '../../common/apis/Alchemy';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HOUR } from '../../utils/time';
import LINQ from 'linq';
import { NFTMetadata } from '../transferring/NonFungibleTokenTransferring';
import Networks from '../core/Networks';
import { getBounceNfts } from '../../common/apis/Bounce';
import { getNftsByOwnerV2 } from '../../common/apis/Rarible';
import { getOpenseaNfts } from '../../common/apis/Opensea';
import { startLayoutAnimation } from '../../utils/animations';

const Keys = {
  nfts: (chainId: number, owner: string) => `nfts_${chainId}_${owner}`,
};

export class NFTViewer {
  private cache = new Map<number, NFTMetadata[]>();

  readonly owner: string;
  nfts: NFTMetadata[] = [];

  constructor(owner: string) {
    this.owner = owner;

    makeObservable(this, { nfts: observable, setNFTs: action });
  }

  setNFTs(nfts: NFTMetadata[]) {
    this.nfts = nfts;
  }

  async refresh(force = false) {
    const { current } = Networks;
    runInAction(() => this.setNFTs([]));

    const items = await this.fetch(current.chainId, force);

    runInAction(() => this.setNFTs(items));
  }

  async fetch(chainId: number, force = false) {
    const cacheItems = this.cache.get(chainId);

    if (cacheItems && !force) {
      return cacheItems;
    }

    let result: NFTMetadata[] | undefined;

    let cache = await AsyncStorage.getItem(Keys.nfts(chainId, this.owner));
    if (cache) {
      const { timestamp, items } = JSON.parse(cache) as { timestamp: number; items: NFTMetadata[] };
      if (Date.now() < timestamp + 12 * HOUR) {
        this.cache.set(chainId, items);
        return items;
      }
    }

    // const network = Networks.find(chainId)?.network;
    switch (chainId) {
      case 1:
        result = convertOpenseaAssetsToNft(await getOpenseaNfts(this.owner));
        break;
      case 137:
      // result = convertRaribleV2ResultToNfts(await getNftsByOwnerV2(this.owner, network), network!);
      case 10:
      case 42161:
        result = convertAlchemyToNfts(await getAlchemyNFTs(this.owner, chainId));
        break;
      case 250:
      case 43114:
      case 42220:
      case 1666600000:
        result = convertAlchemyToNfts(await getCenterNFTs(this.owner, chainId));
        break;
      case 56:
        result = convertBounceToNfts(await getBounceNfts(this.owner));
        break;
    }

    if (!result || result.length === 0) {
      return cacheItems || [];
    }

    result = LINQ.from(result)
      .distinct((n) => n.id)
      .toArray();

    this.cache.set(chainId, result);

    await AsyncStorage.setItem(Keys.nfts(chainId, this.owner), JSON.stringify({ timestamp: Date.now(), items: result }));

    return result;
  }
}
