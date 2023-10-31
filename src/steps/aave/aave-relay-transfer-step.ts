import { AccessCardOwnerAccountContract } from '../../contract/access-card/access-card-owner-account-contract';
import {
  AaveV3TokenData,
  RecipeERC20AmountRecipient,
  StepConfig,
  StepInput,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { ERC20Contract } from '../../contract';
import { NETWORK_CONFIG } from '@railgun-community/shared-models';
import { compareERC20Info } from '../../utils';

export class AaveV3TransferToRelayStep extends Step {
  readonly config: StepConfig = {
    name: 'AAVEv3 ERC20 Transfer',
    description: 'Transfers the specified ERC20 token from Account Contract(AC) to Relay Adapt',
  };

  private readonly data: AaveV3TokenData;
  private readonly ownableContractAddress: string;

  constructor(
    data: AaveV3TokenData,
    ownableContractAddress: string,
  ) {
    super();
    this.data = data;
    this.ownableContractAddress = ownableContractAddress;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { tokenAddress, decimals } = this.data;
    const { networkName, erc20Amounts } = input;

    const ownableContract = new AccessCardOwnerAccountContract(
      this.ownableContractAddress,
    );

    const { erc20AmountForStep, unusedERC20Amounts } = this.getValidInputERC20Amount(
      erc20Amounts,
      erc20Amount => compareERC20Info(erc20Amount, this.data),
      this.data.amount
    );

    const tokenContract = new ERC20Contract(tokenAddress);
    // transfer from AC to relay adapt
    const transferCalldata = await tokenContract.createTransfer(
      NETWORK_CONFIG[networkName].relayAdaptContract,
      this.data.amount ?? erc20AmountForStep.expectedBalance,
    );

    // execute transfer call on Account Contract
    const transferTransaction = await ownableContract.executeCall(
      tokenAddress,
      transferCalldata.data,
      0n,
    );

    const transferredERC20: RecipeERC20AmountRecipient = {
      tokenAddress,
      decimals,
      amount: this.data.amount ?? erc20AmountForStep.expectedBalance,
      recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
    }

    return {
      crossContractCalls: [transferTransaction],
      outputERC20Amounts: [...unusedERC20Amounts],
      spentERC20Amounts: [transferredERC20],
      outputNFTs: [...input.nfts],
    };
  }
}
