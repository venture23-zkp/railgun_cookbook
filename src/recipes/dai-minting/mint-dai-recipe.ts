import { MIN_GAS_LIMIT_ANY_RECIPE } from '../../models/min-gas-limits';
import {
  DaiMintingCollateralInfo,
  RecipeConfig,
  StepInput,
} from '../../models';
import { Recipe } from '../../recipes/recipe';
import { Step } from '../../steps';
import { DaiMinting } from '../../api/dai-minting';
import { DaiLockTokensToAdapterStep } from '../../steps/dai-minting/dai-lock-tokens-to-adapter';
import { DaiAddCollateralToVaultStep } from '../../steps/dai-minting/dai-add-collateral-to-vault-step';
import { DaiAllowMoveDaiToUserStep } from '../../steps/dai-minting/dai-allow-move-dai-to-user-step';
import { DaiMoveDaiToVatStep } from '../../steps/dai-minting/dai-move-dai-to-vat-step';
import { DaiExitToErc20DaiStep } from '../../steps/dai-minting/dai-exit-to-erc20-dai-step';
import { NetworkName } from '@railgun-community/shared-models';
import { AccessCardNFT } from '../../api';
import { getUnshieldedAmountAfterFee } from '../../utils/fee';

const TEN_TO_DECIMALS_18 = 10n ** 18n;
const RAY_DECIMALS = 27n;

export class MintDaiRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Mint DAI token',
    description:
      'Depsoit collateral and mint DAI token after an empty vault is opened',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly ownableContractAddress: string; // account contract (AC)
  private readonly daiMintAmount: bigint;
  private readonly collateralTokenInfo: DaiMintingCollateralInfo;
  private readonly collateralAmount: bigint; // the original collateralAmount. Unshield fee is deducted within the recipe
  private readonly currentIlkRate: bigint; // fetch this from VAT contract -> ilks function
  private readonly vaultAddress: string;
  private readonly cdpId: bigint;

  constructor(
    ownableContractAddress: string,
    daiMintAmount: bigint,
    collateralTokenInfo: DaiMintingCollateralInfo,
    collateralAmount: bigint,
    currentIlkRate: bigint,
    vaultAddress: string,
    cdpId: bigint,
  ) {
    super();
    this.ownableContractAddress = ownableContractAddress;
    this.daiMintAmount = daiMintAmount;
    this.collateralTokenInfo = { ...collateralTokenInfo };
    this.collateralAmount = collateralAmount;
    this.currentIlkRate = currentIlkRate;
    this.vaultAddress = vaultAddress;
    this.cdpId = cdpId;
  }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return AccessCardNFT.supportsNetwork(networkName);
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const { networkName } = firstInternalStepInput;
    const { DAI } = DaiMinting.getDaiMintingInfoForNetwork(networkName);

    const { MCD_JOIN: collateralAdapterAddress } =
      DaiMinting.getDaiMintingInfoForNetwork(networkName)[
        this.collateralTokenInfo.tokenSymbol
      ];

    const realizedCollateralAmount = getUnshieldedAmountAfterFee(
      networkName,
      this.collateralAmount,
    );
    const formattedCollateralAmount =
      (realizedCollateralAmount * TEN_TO_DECIMALS_18) /
      10n ** this.collateralTokenInfo.decimals;

    const formattedDaiMintAmount =
      (this.daiMintAmount * TEN_TO_DECIMALS_18 * 10n ** RAY_DECIMALS) /
        (this.currentIlkRate * 10n ** DAI.DECIMALS) +
      1n;

    return [
      new DaiLockTokensToAdapterStep(
        collateralAdapterAddress,
        this.vaultAddress,
        realizedCollateralAmount,
      ),
      new DaiAddCollateralToVaultStep(
        this.cdpId,
        formattedDaiMintAmount,
        formattedCollateralAmount,
      ),
      new DaiMoveDaiToVatStep(this.cdpId, this.ownableContractAddress),
      new DaiAllowMoveDaiToUserStep(),
      new DaiExitToErc20DaiStep(this.ownableContractAddress),
    ];
  }
}
