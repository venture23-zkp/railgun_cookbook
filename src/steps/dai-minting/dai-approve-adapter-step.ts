import { AccessCardOwnerAccountContract } from '../../contract/access-card/access-card-owner-account-contract';
import {
  AaveV3TokenData,
  RecipeERC20Info,
  StepConfig,
  StepInput,
  StepOutputERC20Amount,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { ERC20Contract } from '../../contract';

export class DaiApproveAdapterStep extends Step {
  readonly config: StepConfig = {
    name: 'Dai Minting Approval',
    description: 'Approves the specified ERC20 token to its adapter contract via AC',
  };

  private readonly tokenInfo: RecipeERC20Info;
  private readonly ownableContractAddress: string;
  private readonly adapterContractAddress: string;
  private readonly amount: bigint;

  constructor(
    tokenInfo: RecipeERC20Info,
    ownableContractAddress: string,
    adapterContractAddress: string,
    amount: bigint,
  ) {
    super();
    this.tokenInfo = tokenInfo;
    this.ownableContractAddress = ownableContractAddress;
    this.adapterContractAddress = adapterContractAddress;
    this.amount = amount;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { tokenAddress } = this.tokenInfo;

    const ownableContract = new AccessCardOwnerAccountContract(
      this.ownableContractAddress,
    );

    const tokenContract = new ERC20Contract(tokenAddress);
    // approve AAVE Pool Contract
    const approveCalldata = await tokenContract.approve(
      this.adapterContractAddress,
      this.amount,
    );

    // approval via ownableContract (Account Contract)
    const approveTransaction = await ownableContract.executeCall(
      tokenAddress,
      approveCalldata.data,
      0n,
    );

    const approvedERC20Amount: StepOutputERC20Amount = {
      tokenAddress: this.tokenInfo.tokenAddress,
      decimals: this.tokenInfo.decimals,
      isBaseToken: this.tokenInfo.isBaseToken,
      expectedBalance: this.amount,
      minBalance: this.amount,
      approvedSpender: this.adapterContractAddress,
    };

    return {
      crossContractCalls: [approveTransaction],
      outputERC20Amounts: [approvedERC20Amount, ...input.erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
