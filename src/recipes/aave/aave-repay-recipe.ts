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
import { MOCK_UNSHIELD_FEE_BASIS_POINTS } from '../../test/mocks.test';
import { Aave } from '../../api';

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

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
    interestRepayMode: number
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.interestRepayMode = interestRepayMode;
  }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return AccessCardNFT.supportsNetwork(networkName);
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const {networkName} = firstInternalStepInput;
    const { AavePoolV3: aavePoolAddress } =
    Aave.getAaveInfoForNetwork(networkName);

    const transferToken: RecipeERC20Info = (({
      tokenAddress,
      decimals,
      isBaseToken,
    }) => ({ tokenAddress, decimals, isBaseToken }))(this.data);

    // todo: This is a bug. Don't use test variables in recipes.
    const amountAfterFee =
      this.data.amount -
      (this.data.amount * MOCK_UNSHIELD_FEE_BASIS_POINTS) / 10_000n;

    return [
      new TransferERC20Step(
        this.ownableContractAddress,
        transferToken,
        amountAfterFee,
      ),
      // approve aaveV3 pool to spend USDC from ownableContract
      new AaveV3ApproveStep(
        {...this.data, amount: amountAfterFee },
        this.ownableContractAddress,
        aavePoolAddress
      ),
      new AaveV3RepayStep(
        { ...this.data, amount: amountAfterFee },
        this.ownableContractAddress,
        aavePoolAddress,
        this.interestRepayMode
      ),
    ];
  }
}
