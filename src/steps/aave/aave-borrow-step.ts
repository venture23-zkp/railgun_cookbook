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

export class AaveV3BorrowStep extends Step {
  readonly config: StepConfig = {
    name: 'AAVEv3 Borrow',
    description: 'Borrows the specified ERC20 token from Aave V3 via AC',
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;
  private readonly aaveV3PoolContractAddress: string;
  private readonly interestRateMode: number;
  private readonly referralCode: number;

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
    aaveV3PoolContractAddress: string,
    interestRateMode: number,
    referralCode: number,
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.aaveV3PoolContractAddress = aaveV3PoolContractAddress;
    this.interestRateMode = interestRateMode;
    this.referralCode = referralCode;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { tokenAddress, amount, decimals } = this.data;

    const ownableContract = new AccessCardOwnerAccountContract(
      this.ownableContractAddress,
    );

    // todo: add relayer fee
    const borrowedToken: StepOutputERC20Amount = {
      expectedBalance: amount,
      minBalance: amount,
      decimals,
      tokenAddress,
      approvedSpender: undefined,
    };

    const aaveV3PoolContract = new AaveV3PoolContract(
      this.aaveV3PoolContractAddress,
    );

    const { data: borrowCalldata } = await aaveV3PoolContract.borrow(
      tokenAddress,
      amount,
      this.ownableContractAddress,
      this.interestRateMode,
      this.referralCode ?? 0,
    );

    const borrowTransaction = await ownableContract.executeCall(
      this.aaveV3PoolContractAddress,
      borrowCalldata,
      0n,
    );

    return {
      crossContractCalls: [borrowTransaction],
      outputERC20Amounts: [borrowedToken],
      outputNFTs: [...input.nfts],
      spentERC20Amounts: [],
    };
  }
}
