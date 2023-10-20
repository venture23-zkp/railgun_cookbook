import { NetworkName } from '@railgun-community/shared-models';
import { AccessCardNFT } from '../../api/access-card/access-card-nft';
import {
  AaveV3TokenData,
  RecipeConfig,
  StepInput,
} from '../../models';
import { MIN_GAS_LIMIT_ANY_RECIPE } from '../../models/min-gas-limits';
import { Recipe } from '../recipe';
import { Step } from '../../steps';
import { AaveV3BorrowStep } from '../../steps/aave/aave-borrow-step';
import { AaveV3TransferToRelayStep } from '../../steps/aave/aave-relay-transfer-step';
import { Aave } from '../../api';

export class AaveV3BorrowRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Borrow ERC20 token from AAVE Pool',
    description:
      'Borrows, transfers and shields the specified ERC20 token from Aave V3 to Railgun Smart Wallet',
    minGasLimit: MIN_GAS_LIMIT_ANY_RECIPE,
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;
  private readonly interestRateMode: number;
  private readonly referralCode: number;

  constructor(data: AaveV3TokenData, ownableContractAddress: string, interestRateMode: number, referralCode: number) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.interestRateMode = interestRateMode;
    this.referralCode = referralCode
  }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return AccessCardNFT.supportsNetwork(networkName);
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const { networkName } = firstInternalStepInput;
    const aaveV3PoolContractAddress =
      Aave.getAaveInfoForNetwork(networkName).AavePoolV3;

    return [
      new AaveV3BorrowStep(
        this.data,
        this.ownableContractAddress,
        aaveV3PoolContractAddress,
        this.interestRateMode,
        this.referralCode,
      ),
      new AaveV3TransferToRelayStep(
        this.data,
        this.ownableContractAddress,
      ),
    ];
  }
}
