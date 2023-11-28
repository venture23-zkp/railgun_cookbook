import {
  RecipeERC20Info,
  StepConfig,
  StepInput,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { DaiMinting } from '../../api/dai-minting';
import { TokenAdapterContract } from '../../contract/dai-minting/token-adapter-contract';
import { compareERC20Info } from '../../utils';

export class DaiExitToErc20DaiStep extends Step {
  readonly config: StepConfig = {
    name: 'Dai - Exit to ERC20 DAI',
    description:
      'Exit the internal dai to the ERC-20 DAI after allowing the Dai adapter to move Dai from VAT to user address',
  };

  private readonly ownerAddress: string;
  private readonly amount: Optional<bigint>;

  constructor(ownerAddress: string, amount?: bigint) {
    super();
    this.ownerAddress = ownerAddress;
    this.amount = amount;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { erc20Amounts, networkName } = input;

    const daiToken: RecipeERC20Info = {
      tokenAddress:
        DaiMinting.getDaiMintingInfoForNetwork(networkName).DAI.ERC20,
      decimals:
        DaiMinting.getDaiMintingInfoForNetwork(networkName).DAI.DECIMALS,
      isBaseToken: false,
    };

    const { erc20AmountForStep } = this.getValidInputERC20Amount(
      erc20Amounts,
      erc20Amount => compareERC20Info(erc20Amount, daiToken),
      this.amount,
    );

    const daiAdapterContract = new TokenAdapterContract(
      DaiMinting.getDaiMintingInfoForNetwork(networkName).DAI.MCD_JOIN,
    );

    const exitToErc20DaiTransaction = await daiAdapterContract.exit(
      this.ownerAddress,
      this.amount ?? erc20AmountForStep.expectedBalance,
    );

    return {
      crossContractCalls: [exitToErc20DaiTransaction],
      outputERC20Amounts: [...erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
