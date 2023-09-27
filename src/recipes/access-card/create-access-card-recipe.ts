import { NetworkName } from '@railgun-community/shared-models';
import { AccessCardNFT } from '../../api/access-card/access-card-nft';
import { RecipeConfig, RecipeCreateAccessCard, RecipeInput, RecipeOutput, StepInput } from '../../models';
import { MIN_GAS_LIMIT_ANY_RECIPE } from '../../models/min-gas-limits';
import { Recipe } from '../recipe';
import { Step } from '../../steps';
import { AccessCardCreateNFTOwnerStep } from '../../steps/access-card/create-nft-owner-step';
import { AccessCardNFTMintStep } from '../../steps/access-card/nft-mint-step';

export class CreateAccessCardRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Create Access Card',
    description:
      'Creates an Ownable Contract and assigns Access Card NFT as owner',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly createAccessCardData: RecipeCreateAccessCard;

  /**
   * Recipe to creates an ownable contract and assign Access Card NFT as owner
   * @param {string} encryptedNFTMetadata Access Card `name` and `description` encrypted with user's viewing key
  */
  constructor(encryptedNFTMetadata: string) {
    super();
    this.createAccessCardData = { encryptedNFTMetadata };
  }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return AccessCardNFT.supportsNetwork(networkName);
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const { networkName } = firstInternalStepInput;

    // Error thrown here if network is not supported
    const { erc721: accessCardNFTAddress } =
      AccessCardNFT.getAddressesForNetwork(networkName);

    const { encryptedNFTMetadata } = this.createAccessCardData;

    return [
      new AccessCardNFTMintStep(accessCardNFTAddress, encryptedNFTMetadata),
      new AccessCardCreateNFTOwnerStep(),
    ];
  }
}
