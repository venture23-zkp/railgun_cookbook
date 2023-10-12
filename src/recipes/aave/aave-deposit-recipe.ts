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
import { MOCK_SHIELD_FEE_BASIS_POINTS } from '../../test/mocks.test';
import { Aave } from '../../api';

export class AaveV3DepositRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Deposit ERC20 token into AAVE Pool',
    description:
      'Transfers, approves and deposits the specified ERC20 token to Aave V3 via AC',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
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

    const amountAfterFee =
      this.data.amount -
      (this.data.amount * MOCK_SHIELD_FEE_BASIS_POINTS) / 10_000n;

    return [
      new TransferERC20Step(
        this.ownableContractAddress,
        transferToken,
        amountAfterFee,
      ),
      new AaveV3ApproveStep(
        {...this.data, amount: amountAfterFee },
        this.ownableContractAddress,
        aavePoolAddress
      ),
      new AaveV3DepositStep(
        { ...this.data, amount: amountAfterFee },
        this.ownableContractAddress,
        aavePoolAddress,
      ),
    ];
  }
}
