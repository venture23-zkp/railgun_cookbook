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
import { compareERC20Info } from '../../utils';

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
    const { tokenAddress, decimals } = this.data;
    const { erc20Amounts } = input;

    const { erc20AmountForStep, unusedERC20Amounts} = this.getValidInputERC20Amount(
      erc20Amounts,
      erc20Amount => compareERC20Info(erc20Amount, this.data),
      this.data.amount
    );

    const ownableContract = new AccessCardOwnerAccountContract(
      this.ownableContractAddress,
    );

    const aaveV3PoolContract = new AaveV3PoolContract(
      this.aaveV3PoolContractAddress,
    );

    const { data: repayCalldata } = await aaveV3PoolContract.repay(
      tokenAddress,
      this.data.amount ?? erc20AmountForStep.expectedBalance,
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
      amount: this.data.amount ?? erc20AmountForStep.expectedBalance,
      recipient: this.ownableContractAddress,
    };

    return {
      crossContractCalls: [repayTransaction],
      outputERC20Amounts: [...unusedERC20Amounts],
      outputNFTs: [...input.nfts],
      spentERC20Amounts: [spentToken],
    };
  }
}
