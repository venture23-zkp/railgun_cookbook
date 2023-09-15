import { Contract, ContractTransaction } from 'ethers';
import { abi } from '../../abi/abi';
import { AccessCardERC721 } from '../../typechain';

export class AccessCardERC721Contract {
  private readonly contract: AccessCardERC721;

  constructor(tokenAddress: string) {
    this.contract = new Contract(
      tokenAddress,
      abi.token.accessCardERC721,
    ) as unknown as AccessCardERC721;
  }

  mint(): Promise<ContractTransaction> {
    return this.contract.mint.populateTransaction();
  }

  setEncryptedMetadata(tokenId: bigint, encryptedMetadata: string): Promise<ContractTransaction> {
    return this.contract.setEncryptedMetadata.populateTransaction(tokenId, encryptedMetadata);
  }
}
