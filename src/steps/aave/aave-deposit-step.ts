import { AccessCardOwnerAccountContract } from '../../contract/access-card/access-card-owner-account-contract';
import {
  AaveV3TokenData,
  RecipeERC20AmountRecipient,
  StepConfig,
  StepInput,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { AaveV3PoolContract } from '../../contract/aave/aave-pool-contract';

export class AaveV3DepositStep extends Step {
  readonly config: StepConfig = {
    name: 'AAVEv3 Deposit',
    description: 'Deposits the specified ERC20 token to Aave V3 via AC',
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;
  private readonly aaveV3PoolContractAddress: string;

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

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { tokenAddress, amount, decimals } = this.data;

    const ownableContract = new AccessCardOwnerAccountContract(
      this.ownableContractAddress,
    );

    // todo: add relayer fee
    const spentToken: RecipeERC20AmountRecipient = {
      amount,
      decimals,
      tokenAddress,
      recipient: this.ownableContractAddress,
    };

    const aaveV3PoolContract = new AaveV3PoolContract(
      this.aaveV3PoolContractAddress,
    );

    const { data: depositCalldata } = await aaveV3PoolContract.deposit(
      tokenAddress,
      amount,
      this.ownableContractAddress,
      0n,
    );

    const depositTransaction = await ownableContract.executeCall(
      this.aaveV3PoolContractAddress,
      depositCalldata,
      0n,
    );

    return {
      crossContractCalls: [depositTransaction],
      outputERC20Amounts: [],
      outputNFTs: [...input.nfts],
      spentERC20Amounts: [spentToken],
    };
  }
}
