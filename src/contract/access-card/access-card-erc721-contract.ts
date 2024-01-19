import { Contract, ContractTransaction, Provider } from 'ethers';
import { abi } from '../../abi/abi';
import { AccessCardERC721 } from '../../typechain';
import { hexlify } from '@railgun-community/wallet';

export class AccessCardERC721Contract {
  private readonly contract: AccessCardERC721;

  constructor(tokenAddress: string, provider?: Provider) {
    this.contract = new Contract(
      tokenAddress,
      abi.token.accessCardERC721,
      provider
    ) as unknown as AccessCardERC721;
  }

  mint(encrytpedMetadata: string): Promise<ContractTransaction> {
    return this.contract.mint.populateTransaction(hexlify(encrytpedMetadata, true));
  }

  setEncryptedMetadata(tokenId: bigint, encryptedMetadata: string): Promise<ContractTransaction> {
    return this.contract.setEncryptedMetadata.populateTransaction(tokenId, hexlify(encryptedMetadata, true));
  }

  async getTotalSupply(): Promise<[bigint]> {
    return this.contract.totalSupply.staticCallResult();
  }

  async getEncryptedMetadata(tokenId: bigint): Promise<[string]> {
    return this.contract.encryptedMetadata.staticCallResult(tokenId);
  }

  async getBalanceOf(address: string): Promise<[bigint]> {
    return this.contract.balanceOf.staticCallResult(address);
  }

  async getOwnerOf(tokenSubId: bigint): Promise<[string]> {
    return this.contract.ownerOf.staticCallResult(tokenSubId);
  }
}
