import { CdpManagerContract } from '../../contract/dai-minting/cdp-manager-contract';
import {
  StepConfig,
  StepInput,
  StepOutputERC20Amount,
  UnvalidatedStepOutput,
} from '../../models';
import { Step } from '../step';
import { DaiMinting } from '../../api/dai-minting';

export class DaiAddCollateralToVaultStep extends Step {
  readonly config: StepConfig = {
    name: 'Dai - Add collateral into vault',
    description: 'Add the locked token into vault as collateral',
  };

  private readonly cdpId: bigint;
  private readonly collateralAmount: bigint;
  private readonly daiMintAmount: bigint;

  constructor(
    cdpId: bigint,
    formattedDaiMintAmount: bigint,
    collateralAmountTenPow18: bigint,
  ) {
    super();
    this.cdpId = cdpId;
    this.collateralAmount = collateralAmountTenPow18;
    this.daiMintAmount = formattedDaiMintAmount;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { networkName, erc20Amounts } = input;

    const cdpManagerContract = new CdpManagerContract(
      DaiMinting.getDaiMintingInfoForNetwork(networkName).CDP_MANAGER,
    );

    const { DAI } = DaiMinting.getDaiMintingInfoForNetwork(networkName);

    const addCollateralTransaction = await cdpManagerContract.addCollateral(
      this.cdpId,
      this.collateralAmount,
      this.daiMintAmount,
    );

    const mintedDaiToken: StepOutputERC20Amount = {
      tokenAddress: DAI.ERC20,
      decimals: DAI.DECIMALS,
      isBaseToken: false,
      expectedBalance: this.daiMintAmount,
      minBalance: this.daiMintAmount,
      approvedSpender: undefined,
    };

    return {
      crossContractCalls: [addCollateralTransaction],
      outputERC20Amounts: [...erc20Amounts, mintedDaiToken],
      outputNFTs: [...input.nfts],
    };
  }
}
