import { AccessCardOwnerAccountContract } from '../../contract/access-card/access-card-owner-account-contract';
import {
  AaveV3TokenData,
  StepConfig,
  StepInput,
  StepOutputERC20Amount,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { AaveV3PoolContract } from '../../contract/aave/aave-pool-contract';

export class AaveV3WithdrawStep extends Step {
  readonly config: StepConfig = {
    name: 'AAVEv3 Withdraw',
    description: 'Withdraws the specified ERC20 token from Aave V3 to Account Contract(AC)',
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

    const aaveV3PoolContract = new AaveV3PoolContract(
      this.aaveV3PoolContractAddress,
    );

    const { data: withdrawCalldata } = await aaveV3PoolContract.withdraw(
      tokenAddress,
      amount,
      this.ownableContractAddress,
    );

    const withdrawTransaction = await ownableContract.executeCall(
      this.aaveV3PoolContractAddress,
      withdrawCalldata,
      0n,
    );

    const outputErc20Tokens: StepOutputERC20Amount = {
      tokenAddress,
      decimals,
      approvedSpender: undefined,
      expectedBalance: amount,
      minBalance: amount,
    }

    return {
      crossContractCalls: [withdrawTransaction],
      outputERC20Amounts: [...input.erc20Amounts, outputErc20Tokens],
      outputNFTs: [...input.nfts],
      spentERC20Amounts: [],
    };
  }
}
