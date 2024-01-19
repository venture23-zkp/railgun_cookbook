import { RelayAdaptContract } from '../../contract';
import { StepConfig, StepInput, UnvalidatedStepOutput } from '../../models';
import { Step } from '../../steps/step';

export class AccessCardCreateNFTOwnerStep extends Step {
  readonly config: StepConfig = {
    name: 'Access Card Create NFT Owner',
    description: 'Creates an Ownable Contract for a user',
  };

  constructor() {
    super();
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { networkName } = input;

    const contract = new RelayAdaptContract(networkName);
    const crossContractCall = await contract.createNFTAccount();

    return {
      crossContractCalls: [crossContractCall],
      outputERC20Amounts: input.erc20Amounts,
      outputNFTs: input.nfts,
    };
  }
}
