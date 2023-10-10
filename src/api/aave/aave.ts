import { NetworkName } from '@railgun-community/shared-models';

export class Aave {
  static getAaveInfoForNetwork(networkName: NetworkName) {
    switch (networkName) {
      case NetworkName.Ethereum:
        return {
          AavePoolV3: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
          aToken: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c',
        };
      default:
        throw new Error('AAVE transaction is not supported on this network');
    }
  }
}
