import { NetworkName } from '@railgun-community/shared-models';
import { AccessCardNFT } from 'api/access-card/access-card-nft';
import { RecipeConfig, RecipeCreateAccessCard, StepInput } from 'models';
import { MIN_GAS_LIMIT_ANY_RECIPE } from 'models/min-gas-limits';
import { Recipe } from 'recipes/recipe';
import { Step } from 'steps';
import { AccessCardCreateNFTOwnerStep } from 'steps/access-card/create-nft-owner-step';
import { AccessCardNftMintStep } from 'steps/access-card/nft-mint-step';
import { AccessCardSetNFTMetadataStep } from 'steps/access-card/set-nft-metadata';

export class CreateAccessCardRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Create Access Card',
    description:
      'Creates an Ownable Contract and assigns Access Card NFT as owner',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly createAccessCardData: RecipeCreateAccessCard;

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

    return [
      new AccessCardNftMintStep(accessCardNFTAddress),
      new AccessCardSetNFTMetadataStep(
        accessCardNFTAddress,
        this.createAccessCardData.encryptedNFTMetadata,
      ),
      new AccessCardCreateNFTOwnerStep(),
    ];
  }
}
