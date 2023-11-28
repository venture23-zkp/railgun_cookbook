import { CdpManagerContract } from '../../contract/dai-minting/cdp-manager-contract';
import {
  RecipeERC20AmountRecipient,
  RecipeERC20Info,
  StepConfig,
  StepInput,
  StepOutputERC20Amount,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { DaiMinting } from '../../api/dai-minting';
import { compareERC20Info } from '../../utils';

export class DaiAddCollateralToVault extends Step {
  readonly config: StepConfig = {
    name: 'Dai - Add collateral into vault',
    description: 'Add the locked token into vault as collateral',
  };

  private readonly cdpId: bigint;
  private readonly vaultAddress: string;
  private readonly collateralAmount: Optional<bigint>;
  private readonly daiMintAmount: bigint;
  private readonly lockTokenData: RecipeERC20Info;

  constructor(
    cdpId: bigint,
    vaultAddress: string,
    daiMintAmount: bigint,
    lockTokenData: RecipeERC20Info,
    collateralAmount?: bigint,
  ) {
    super();
    this.cdpId = cdpId;
    this.vaultAddress = vaultAddress;
    this.collateralAmount = collateralAmount;
    this.daiMintAmount = daiMintAmount;
    this.lockTokenData = lockTokenData;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { networkName, erc20Amounts } = input;

    const cdpManagerContract = new CdpManagerContract(
      DaiMinting.getDaiMintingInfoForNetwork(networkName).CDP_MANAGER,
    );

    const { erc20AmountForStep, unusedERC20Amounts } =
      this.getValidInputERC20Amount(
        erc20Amounts,
        erc20Amount => compareERC20Info(erc20Amount, this.lockTokenData),
        this.collateralAmount,
      );

    const addCollateralTransaction = await cdpManagerContract.addCollateral(
      this.cdpId,
      this.collateralAmount ?? erc20AmountForStep.expectedBalance,
      this.daiMintAmount,
    );

    const mintedDaiToken: StepOutputERC20Amount = {
      tokenAddress:
        DaiMinting.getDaiMintingInfoForNetwork(networkName).DAI.ERC20,
      decimals:
        DaiMinting.getDaiMintingInfoForNetwork(networkName).DAI.DECIMALS,
      isBaseToken: false,
      expectedBalance: this.daiMintAmount,
      minBalance: this.daiMintAmount,
      approvedSpender: undefined,
    };

    const spentCollateralToken: RecipeERC20AmountRecipient = {
      tokenAddress: this.lockTokenData.tokenAddress,
      decimals: this.lockTokenData.decimals,
      recipient: this.vaultAddress,
      amount: erc20AmountForStep.expectedBalance,
    };

    return {
      crossContractCalls: [addCollateralTransaction],
      outputERC20Amounts: [...unusedERC20Amounts, mintedDaiToken],
      spentERC20Amounts: [spentCollateralToken],
      outputNFTs: [...input.nfts],
    };
  }
}
