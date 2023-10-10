import { NetworkName } from '@railgun-community/shared-models';
import { AccessCardNFT } from '../../api/access-card/access-card-nft';
import {
  AaveV3TokenData,
  RecipeConfig,
  RecipeCreateAccessCard,
  RecipeERC20Info,
  RecipeInput,
  RecipeOutput,
  StepInput,
} from '../../models';
import { MIN_GAS_LIMIT_ANY_RECIPE } from '../../models/min-gas-limits';
import { Recipe } from '../recipe';
import { Step, TransferERC20Step } from '../../steps';
import { AaveV3ApproveStep, AaveV3DepositStep } from '../../steps/aave';
import { MOCK_SHIELD_FEE_BASIS_POINTS } from '../../test/mocks.test';

export class AaveV3DepositRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Deposit ERC20 token into AAVE Pool',
    description:
      'Transfers, approves and deposits the specified ERC20 token to Aave V3 via AC',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;
  private readonly aaveV3PoolContractAddress: string;

  /**
   * Recipe to transfer, approve and deposit the specified ERC20 token to Aave V3 via AC
   * @param {string} encryptedNFTMetadata Access Card `name` encrypted with user's viewing key
   */
  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
    aaveV3PoolContractAddress: string,
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.aaveV3PoolContractAddress = aaveV3PoolContractAddress;
  }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return AccessCardNFT.supportsNetwork(networkName);
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
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
        this.data,
        this.ownableContractAddress,
        this.aaveV3PoolContractAddress,
      ),
      new AaveV3DepositStep(
        this.data,
        this.ownableContractAddress,
        this.aaveV3PoolContractAddress,
      ),
    ];
  }
}
