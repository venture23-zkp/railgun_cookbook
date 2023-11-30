import { compareERC20Info } from '../../utils';
import {
  RecipeERC20Info,
  StepConfig,
  StepInput,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { DaiMinting } from '../../api/dai-minting';
import { CdpManagerContract } from '../../contract/dai-minting/cdp-manager-contract';

export class DaiMoveDaiToVatStep extends Step {
  readonly config: StepConfig = {
    name: 'Dai - Move Dai to VAT for a user',
    description:
      'Move minted Dai tokens (technically owned by DAI adapter of MCD) to VAT for a user account',
  };

  private readonly cdpId: bigint;
  private readonly ownerAddress: string; // DAI will be transferred to this address
  private readonly amount: Optional<bigint>; // amount to transfer

  constructor(cdpId: bigint, ownerAddress: string, amount?: bigint) {
    super();
    this.cdpId = cdpId;
    this.ownerAddress = ownerAddress;
    this.amount = amount;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { erc20Amounts, networkName } = input;

    const cdpManagerContract = new CdpManagerContract(
      DaiMinting.getDaiMintingInfoForNetwork(networkName).CDP_MANAGER,
    );

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

    const moveDaiTransaction = await cdpManagerContract.moveDaiToVatForAddress(
      this.cdpId,
      this.ownerAddress,
      this.amount ?? erc20AmountForStep.expectedBalance,
    );

    return {
      crossContractCalls: [moveDaiTransaction],
      outputERC20Amounts: [...erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}