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
import { AaveV3ApproveStep, AaveV3RepayStep } from '../../steps/aave';
import { Aave } from '../../api';
import { getUnshieldedAmountAfterFee } from '../../utils/fee';

export class AaveV3RepayRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Repays ERC20 token into AAVE Pool',
    description:
      'Transfers, approves and repays the specified ERC20 token to Aave V3 via AC',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;
  private readonly interestRepayMode: number;
  private readonly repayAmount: bigint;

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
    repayAmount: bigint,
    interestRepayMode: number,
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.interestRepayMode = interestRepayMode;
    this.repayAmount = repayAmount;
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

    const transferToken: RecipeERC20Info = (({
      tokenAddress,
      decimals,
      isBaseToken,
    }) => ({ tokenAddress, decimals, isBaseToken }))(this.data);

    const amountAfterFee = getUnshieldedAmountAfterFee(
      networkName,
      this.repayAmount,
    );

    return [
      new TransferERC20Step(
        this.ownableContractAddress,
        transferToken,
        amountAfterFee,
      ),
      // approve aaveV3 pool to spend USDC from ownableContract
      new AaveV3ApproveStep(
        { ...this.data, amount: undefined },
        this.ownableContractAddress,
        aavePoolAddress,
        amountAfterFee,
      ),
      new AaveV3RepayStep(
        { ...this.data, amount: undefined },
        this.ownableContractAddress,
        aavePoolAddress,
        this.interestRepayMode,
      ),
    ];
  }
}
