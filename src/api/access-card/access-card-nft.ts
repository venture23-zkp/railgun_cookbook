import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';
import { Provider } from 'ethers';
import { ERC6551RegistryContract } from '../../contract/registry/erc6551-registry-contract';

type AccessCardAccounts = {
  erc721: string;
  defaultAccount: string;
  defaultRegistry: string;
};

export class AccessCardNFT {
  static getAddressesForNetwork(networkName: NetworkName): AccessCardAccounts {
    switch (networkName) {
      case NetworkName.Ethereum:
      case NetworkName.Hardhat:
        return {
          // todo: Deploy actual contracts on chains
          erc721: '0xCD021da010284100B81D3eef420e28451D232FAF',
          defaultAccount: '0x85017212843d0Bcaea013DBEaBb8E6491d67BbeC',
          defaultRegistry: '0xa56D94F9b2412A639626C11855a72024345f2E17',
        };
      case NetworkName.Arbitrum:
      case NetworkName.BNBChain:
      case NetworkName.Railgun:
      case NetworkName.Polygon:
      case NetworkName.EthereumRopsten_DEPRECATED:
      case NetworkName.EthereumGoerli:
      case NetworkName.PolygonMumbai:
      case NetworkName.ArbitrumGoerli:
        throw new Error('Access card NFT not supported on this network');
    }
  }

  static supportsNetwork(networkName: NetworkName) {
    try {
      this.getAddressesForNetwork(networkName);
      return true;
    } catch {
      return false;
    }
  }

  static getOwnableContractAddress(
    registryContractAddress: string,
    defaultAccountAddress: string,
    nftTokenSubID: string,
    networkName: NetworkName,
    provider: Provider,
  ): Promise<string> {
    const registryContract = new ERC6551RegistryContract(
      registryContractAddress,
      provider,
    );
    return registryContract.getAccountContract(
      defaultAccountAddress,
      this.getAddressesForNetwork(networkName).erc721,
      nftTokenSubID,
      NETWORK_CONFIG[networkName].chain.id,
    );
  }
}
