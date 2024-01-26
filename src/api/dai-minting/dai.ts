import { NetworkName } from '@railgun-community/shared-models';

export class DaiMinting {
  static getDaiMintingInfoForNetwork(networkName: NetworkName) {
    switch (networkName) {
      // case NetworkName.Ethereum:
      //   // todo: add more tokens. If possible use API to get addresses list
      //   return {
      //     CDP_MANAGER: '0x5ef30b9986345249bc32d8928b7ee64de9435e39',
      //     MCD_VAT: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b', // Central state storage for MCD
      //     WBTC: {
      //       ERC20: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      //       MCD_JOIN: '0xbf72da2bd84c5170618fbe5914b0eca9638d5eb5', // WBTC Adapter
      //       ADAPTER_ILK_NAME: 'WBTC-A',
      //       DECIMALS: 8n,
      //     },
      //     DAI: {
      //       ERC20: '0x6b175474e89094c44da98b954eedeac495271d0f',
      //       MCD_JOIN: '0x9759a6ac90977b93b58547b4a71c78317f391a28', // DAI adapter
      //       DECIMALS: 18n,
      //     },
      //   };
      case NetworkName.Ethereum:
        return {
          CDP_MANAGER: '0xdcbf58c9640a7bd0e062f8092d70fb981bb52032',
          MCD_VAT: '0xb966002ddaa2baf48369f5015329750019736031', // Central state storage for MCD
          WBTC: {
            ERC20: '0x7ccf0411c7932b99fc3704d68575250f032e3bb7',
            MCD_JOIN: '0x3cbe712a12e651eeaf430472c0c1bf1a2a18939d', // WBTC Adapter
            ADAPTER_ILK_NAME: 'WBTC-A',
            DECIMALS: 8n,
          },
          DAI: {
            ERC20: '0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844',
            MCD_JOIN: '0x6a60b7070befb2bfc964f646efdf70388320f4e0', // DAI adapter
            DECIMALS: 18n,
          },
        }
      default:
        throw new Error('DAI minting is not supported on this network');
    }
  }
}
