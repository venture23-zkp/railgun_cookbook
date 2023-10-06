import { AccessCardERC721Contract } from '../../contract/access-card/access-card-erc721-contract';
import {
  StepConfig,
  StepInput,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';

export class AccessCardSetNFTMetadataStep extends Step {
  readonly config: StepConfig = {
    name: 'Access Card Set NFT Metadata',
    description: 'Set Name and Description for the Access Card NFT as owner',
  };

  private readonly accessCardNFTAddress: string;
  private readonly encryptedNFTMetadata: string;
  private readonly nftTokenSubID: string;

  constructor(
    accessCardNFTAddress: string,
    encryptedNFTMetadata: string,
    nftTokenSubID: string,
  ) {
    super();
    this.accessCardNFTAddress = accessCardNFTAddress;
    this.encryptedNFTMetadata = encryptedNFTMetadata;
    this.nftTokenSubID = nftTokenSubID;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const contract = new AccessCardERC721Contract(this.accessCardNFTAddress);

    const crossContractCall = await contract.setEncryptedMetadata(BigInt(this.nftTokenSubID), this.encryptedNFTMetadata);

    return {
      crossContractCalls: [crossContractCall],
      outputERC20Amounts: input.erc20Amounts,
      outputNFTs: input.nfts,
    }
  }
}
