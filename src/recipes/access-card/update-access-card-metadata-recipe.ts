import { NetworkName } from '@railgun-community/shared-models';
import { AccessCardNFT } from '../../api/access-card/access-card-nft';
import { RecipeConfig, StepInput } from '../../models';
import { MIN_GAS_LIMIT_ANY_RECIPE } from '../../models/min-gas-limits';
import { Recipe } from '../recipe';
import { Step } from '../../steps';
import { AccessCardSetNFTMetadataStep } from '../../steps/access-card/set-nft-metadata';

export class UpdateAccessCardMetadataRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Update NFT Metadata',
    description:
      'Updates Access Card NFT metadata',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly encryptedNFTMetadata: string;
  private readonly nftTokenSubID: string;

  /**
   * Recipe to update Access Card NFT metadata
   * @param {string} encryptedNFTMetadata Access Card `name` encrypted with user's viewing key
   */
  constructor(encryptedNFTMetadata: string, nftTokenSubID: string) {
    super();
    this.encryptedNFTMetadata = encryptedNFTMetadata;
    this.nftTokenSubID = nftTokenSubID;
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
      new AccessCardSetNFTMetadataStep(
        accessCardNFTAddress,
        this.encryptedNFTMetadata,
        this.nftTokenSubID,
      ),
    ];
  }
}
