import { AccessCardOwnerAccountContract } from '../../contract/access-card/access-card-owner-account-contract';
import {
  AaveV3TokenData,
  StepConfig,
  StepInput,
  StepOutputERC20Amount,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { ERC20Contract } from '../../contract';

export class AaveV3ApproveStep extends Step {
  readonly config: StepConfig = {
    name: 'AAVEv3 Approval',
    description: 'Approves the specified ERC20 token to Aave V3 via AC',
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;
  private readonly aaveV3PoolContractAddress: string;
  private readonly amount: bigint;

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
    aaveV3PoolContractAddress: string,
    amount: bigint,
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.aaveV3PoolContractAddress = aaveV3PoolContractAddress;
    this.amount = amount;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { tokenAddress } = this.data;

    const ownableContract = new AccessCardOwnerAccountContract(
      this.ownableContractAddress,
    );

    const tokenContract = new ERC20Contract(tokenAddress);
    // approve AAVE Pool Contract
    const approveCalldata = await tokenContract.approve(
      this.aaveV3PoolContractAddress,
      this.amount,
    );

    // approve USDC for AAVE pool contract
    const approveTransaction = await ownableContract.executeCall(
      tokenAddress,
      approveCalldata.data,
      0n,
    );

    const approvedERC20Amount: StepOutputERC20Amount = {
      tokenAddress: this.data.tokenAddress,
      decimals: this.data.decimals,
      isBaseToken: this.data.isBaseToken,
      expectedBalance: this.amount,
      minBalance: this.amount,
      approvedSpender: this.aaveV3PoolContractAddress,
    };

    return {
      crossContractCalls: [approveTransaction],
      outputERC20Amounts: [approvedERC20Amount, ...input.erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
