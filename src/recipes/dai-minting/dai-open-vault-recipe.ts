import { MIN_GAS_LIMIT_ANY_RECIPE } from '../../models/min-gas-limits';
import {
  DaiMintingCollateralInfo,
  RecipeConfig,
  StepInput,
} from '../../models';
import { Recipe } from '../recipe';
import { Step, TransferERC20Step } from '../../steps';
import { DaiMinting } from '../../api/dai-minting';
import { DaiOpenVaultStep } from '../../steps/dai-minting/dai-open-vault-step';
import { NetworkName } from '@railgun-community/shared-models';
import { AccessCardNFT } from '../../api';
import { DaiApproveAdapterStep } from '../../steps/dai-minting/dai-approve-adapter-step';
import { getUnshieldedAmountAfterFee } from '../../utils/fee';

export class DaiOpenVaultRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Open vault for minting DAI',
    description: 'Opens an empty vault which can be used to lock collateral info',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly ownableContractAddress: string; // account contract (AC)
  private readonly collateralAmount: bigint;
  private readonly collateralTokenInfo: DaiMintingCollateralInfo;

  constructor(
    ownableContractAddress: string,
    collateralAmount: bigint,
    collateralTokenInfo: DaiMintingCollateralInfo,
  ) {
    super();
    this.ownableContractAddress = ownableContractAddress;
    this.collateralAmount = collateralAmount;
    this.collateralTokenInfo = { ...collateralTokenInfo };
  }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return AccessCardNFT.supportsNetwork(networkName);
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const { networkName } = firstInternalStepInput;

    const {
      MCD_JOIN: collateralAdapterAddress,
      ADAPTER_ILK_NAME: collateralIlkName,
    } =
      DaiMinting.getDaiMintingInfoForNetwork(networkName)[
        this.collateralTokenInfo.tokenSymbol
      ];

    return [
      new TransferERC20Step(
        this.ownableContractAddress,
        this.collateralTokenInfo,
      ),
      new DaiApproveAdapterStep(
        this.collateralTokenInfo,
        this.ownableContractAddress,
        collateralAdapterAddress,
        getUnshieldedAmountAfterFee(networkName, this.collateralAmount),
      ),
      new DaiOpenVaultStep(collateralIlkName, this.ownableContractAddress),
    ];
  }
}
