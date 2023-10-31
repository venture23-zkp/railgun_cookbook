import { NetworkName } from '@railgun-community/shared-models';
import { AccessCardNFT } from '../../api/access-card/access-card-nft';
import {
  AaveV3TokenData,
  RecipeConfig,
  RecipeERC20Info,
  StepInput,
} from '../../models';
import { MIN_GAS_LIMIT_ANY_RECIPE } from '../../models/min-gas-limits';
import { Recipe } from '../recipe';
import { Step, TransferERC20Step } from '../../steps';
import { AaveV3ApproveStep, AaveV3DepositStep } from '../../steps/aave';
import { Aave } from '../../api';
import { getUnshieldedAmountAfterFee } from '../../utils/fee';

export class AaveV3DepositRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Deposit ERC20 token into AAVE Pool',
    description:
      'Transfers, approves and deposits the specified ERC20 token to Aave V3 via AC',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;
  private readonly depositAmount: bigint;

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
    depositAmount: bigint,
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.depositAmount = depositAmount;
  }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return AccessCardNFT.supportsNetwork(networkName);
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const { networkName } = firstInternalStepInput;
    const { AavePoolV3: aavePoolAddress } =
      Aave.getAaveInfoForNetwork(networkName);

    const depositToken: RecipeERC20Info = (({
      tokenAddress,
      decimals,
      isBaseToken,
    }) => ({ tokenAddress, decimals, isBaseToken }))(this.data);

    const amountAfterFee = getUnshieldedAmountAfterFee(
      networkName,
      this.depositAmount,
    );

    return [
      new TransferERC20Step(
        this.ownableContractAddress,
        depositToken,
        amountAfterFee,
      ),
      new AaveV3ApproveStep(
        { ...this.data, amount: undefined },
        this.ownableContractAddress,
        aavePoolAddress,
        amountAfterFee
      ),
      new AaveV3DepositStep(
        {...this.data, amount: undefined},
        this.ownableContractAddress,
        aavePoolAddress,
      ),
    ];
  }
}
