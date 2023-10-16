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

export class AaveV3RepayStep extends Step {
  readonly config: StepConfig = {
    name: 'AAVEv3 Repay',
    description:
      'Repays the specified ERC20 token from Account Contract(AC) to Aave V3',
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;
  private readonly aaveV3PoolContractAddress: string;
  private readonly interestRepayMode: number;

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
    aaveV3PoolContractAddress: string,
    interestRepayMode: number,
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.aaveV3PoolContractAddress = aaveV3PoolContractAddress;
    this.interestRepayMode = interestRepayMode;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { tokenAddress, amount, decimals } = this.data;

    const ownableContract = new AccessCardOwnerAccountContract(
      this.ownableContractAddress,
    );

    const aaveV3PoolContract = new AaveV3PoolContract(
      this.aaveV3PoolContractAddress,
    );

    const { data: repayCalldata } = await aaveV3PoolContract.repay(
      tokenAddress,
      amount,
      this.ownableContractAddress,
      this.interestRepayMode,
    );

    const repayTransaction = await ownableContract.executeCall(
      this.aaveV3PoolContractAddress,
      repayCalldata,
      0n,
    );

    const spentToken: RecipeERC20AmountRecipient = {
      tokenAddress: tokenAddress,
      decimals: decimals,
      amount: amount,
      recipient: this.ownableContractAddress,
    };

    return {
      crossContractCalls: [repayTransaction],
      outputERC20Amounts: [...input.erc20Amounts],
      outputNFTs: [...input.nfts],
      spentERC20Amounts: [spentToken],
    };
  }
}
