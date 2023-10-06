import {
  RecipeNFTInfo,
  StepConfig,
  StepInput,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../../steps/step';
import { NFTTokenType } from '@railgun-community/shared-models';
import { AccessCardERC721Contract } from '../../contract/access-card/access-card-erc721-contract';

export class AccessCardNFTMintStep extends Step {
  readonly config: StepConfig = {
    name: 'Access Card NFT Mint',
    description:
      'Mints an Access Card NFT, which can be assigned as owner to a Mech or Safe',
  };

  private readonly accessCardNFTAddress: string;

  constructor(accessCardNFTAddress: string) {
    super();
    this.accessCardNFTAddress = accessCardNFTAddress;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const contract = new AccessCardERC721Contract(this.accessCardNFTAddress);
    const crossContractCall = await contract.mint();

    const accessCardNFT: RecipeNFTInfo = {
      nftAddress: this.accessCardNFTAddress,
      nftTokenType: NFTTokenType.ERC721,
      // todo:
      tokenSubID: '0',
      amount: 1n,
      owns: undefined,
    };

    return {
      crossContractCalls: [crossContractCall],
      outputERC20Amounts: input.erc20Amounts,
      outputNFTs: [accessCardNFT, ...input.nfts],
    };
  }
}
