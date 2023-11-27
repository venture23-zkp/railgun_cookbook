import { TokenAdapterContract } from 'contract/dai-minting/token-adapter-contract';
import {
  RecipeERC20Info,
  StepConfig,
  StepInput,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { compareERC20Info } from '../../utils';

export class DaiLockTokensToAdapterStep extends Step {
  readonly config: StepConfig = {
    name: 'Dai - Lock tokens ',
    description: 'Locks collateral tokens on the token adapter contract',
  };

  private readonly tokenAdapterContractAddress: string;
  private readonly vaultAddress: string;
  private readonly lockTokenData: RecipeERC20Info;
  private readonly amount: Optional<bigint>;

  constructor(
    tokenAdapterContractAddress: string,
    vaultAddress: string,
    lockTokenData: RecipeERC20Info,
    amount?: bigint,
  ) {
    super();
    this.tokenAdapterContractAddress = tokenAdapterContractAddress;
    this.vaultAddress = vaultAddress;
    this.lockTokenData = { ...lockTokenData };
    this.amount = amount;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { erc20Amounts } = input;

    const { erc20AmountForStep, unusedERC20Amounts } =
      this.getValidInputERC20Amount(
        erc20Amounts,
        erc20Amount => compareERC20Info(erc20Amount, this.lockTokenData),
        this.amount,
      );

    const tokenAdapterContract = new TokenAdapterContract(
      this.tokenAdapterContractAddress,
    );

    const lockCollateralTransaction = await tokenAdapterContract.join(
      this.vaultAddress,
      this.amount ?? erc20AmountForStep.expectedBalance,
    );

    return {
      crossContractCalls: [lockCollateralTransaction],
      outputERC20Amounts: [...unusedERC20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
