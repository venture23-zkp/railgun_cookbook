import { StepConfig, StepInput, UnvalidatedStepOutput } from '../../models';
import { Step } from '../step';
import { DaiMinting } from '../../api/dai-minting';
import { McdVatContract } from '../../contract/dai-minting/mcd-vat-contract';

export class DaiAllowMoveDaiToUserStep extends Step {
  readonly config: StepConfig = {
    name: 'Dai - Allow the Dai adapter to move Dai',
    description:
      'Allow the Dai adapter to move Dai from VAT to user address',
  };

  constructor() {
    super();
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { erc20Amounts, networkName } = input;

    const mcdVatContract = new McdVatContract(
      DaiMinting.getDaiMintingInfoForNetwork(networkName).MCD_VAT,
    );

    const moveDaiTransaction = await mcdVatContract.allowDaiWithdrawal(
      DaiMinting.getDaiMintingInfoForNetwork(networkName).DAI.MCD_JOIN,
    );

    return {
      crossContractCalls: [moveDaiTransaction],
      outputERC20Amounts: [...erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
