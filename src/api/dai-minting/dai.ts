import { NetworkName } from '@railgun-community/shared-models';

export class DaiMinting {
  static getDaiMintingInfoForNetwork(networkName: NetworkName) {
    switch (networkName) {
      case NetworkName.Ethereum:
        // todo: add more tokens. If possible use API to get addresses list
        return {
          CDP_MANAGER: '0x5ef30b9986345249bc32d8928b7ee64de9435e39',
          MCD_VAT: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b', // Central state storage for MCD
          WBTC: {
            ERC20: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            MCD_JOIN: '0xbf72da2bd84c5170618fbe5914b0eca9638d5eb5', // WBTC Adapter
            ADAPTER_ILK_NAME: 'WBTC-A',
            DECIMALS: 8n,
          },
          DAI: {
            ERC20: '0x6b175474e89094c44da98b954eedeac495271d0f',
            MCD_JOIN: '0x9759a6ac90977b93b58547b4a71c78317f391a28', // DAI adapter
            DECIMALS: 18n,
          },
        };
      default:
        throw new Error('DAI minting is not supported on this network');
    }
  }
}
