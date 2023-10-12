import { AccessCardOwnerAccountContract } from '../../contract/access-card/access-card-owner-account-contract';
import {
  AaveV3TokenData,
  StepConfig,
  StepInput,
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

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
    aaveV3PoolContractAddress: string
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
    this.aaveV3PoolContractAddress = aaveV3PoolContractAddress;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { tokenAddress, amount } = this.data;

    const ownableContract = new AccessCardOwnerAccountContract(
      this.ownableContractAddress,
    );

    const usdcContract = new ERC20Contract(tokenAddress);
    // approve AAVE Pool Contract
    const approveCalldata = await usdcContract.approve(
      this.aaveV3PoolContractAddress,
      amount,
    );

    // approve USDC for AAVE pool contract
    const approveTransaction = await ownableContract.executeCall(
      tokenAddress,
      approveCalldata.data,
      0n,
    );

    return {
      crossContractCalls: [approveTransaction],
      outputERC20Amounts: [...input.erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
