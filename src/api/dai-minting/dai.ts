import { NetworkName } from '@railgun-community/shared-models';

export class DaiMinting {
  static getDaiMintingInfoForNetwork(networkName: NetworkName) {
    switch (networkName) {
      case NetworkName.Ethereum:
        // todo: add more tokens. If possible use API to get addresses list
        return {
          CDP_MANAGER: '0x5ef30b9986345249bc32d8928B7ee64DE9435E39',
          MCD_VAT: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B', // Central state storage for MCD
          WBTC: {
            ERC20: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            MCD_JOIN_WBTC_A: '0xBF72Da2Bd84c5170618Fbe5914B0ECA9638d5eb5', // WBTC Adapter
            ADAPTER_ILK_NAME: 'WBTC-A',
            DECIMALS: 8n,
          },
          DAI: {
            ERC20: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            MCD_JOIN_DAI: '0x9759A6Ac90977b93B58547b4A71c78317f391A28', // DAI adapter
            DECIMALS: 18n,
          },
        };
      default:
        throw new Error('DAI minting is not supported on this network');
    }
  }
}
