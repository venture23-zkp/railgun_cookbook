import { TokenAdapterContract } from '../../contract/dai-minting/token-adapter-contract';
import { StepConfig, StepInput, UnvalidatedStepOutput } from '../../models';
import { Step } from '../step';

export class DaiLockTokensToAdapterStep extends Step {
  readonly config: StepConfig = {
    name: 'Dai - Lock tokens',
    description: 'Locks collateral tokens on the token adapter contract',
  };

  private readonly tokenAdapterContractAddress: string;
  private readonly vaultAddress: string;
  private readonly amount: bigint;

  constructor(
    tokenAdapterContractAddress: string,
    vaultAddress: string,
    amount: bigint,
  ) {
    super();
    this.tokenAdapterContractAddress = tokenAdapterContractAddress;
    this.vaultAddress = vaultAddress;
    this.amount = amount;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const tokenAdapterContract = new TokenAdapterContract(
      this.tokenAdapterContractAddress,
    );

    const lockCollateralTransaction = await tokenAdapterContract.join(
      this.vaultAddress,
      this.amount,
    );

    return {
      crossContractCalls: [lockCollateralTransaction],
      outputERC20Amounts: [...input.erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
