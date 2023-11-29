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
    daiMintAmount: bigint,
    collateralAmount: bigint,
  ) {
    super();
    this.cdpId = cdpId;
    this.collateralAmount = collateralAmount;
    this.daiMintAmount = daiMintAmount;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { networkName, erc20Amounts } = input;

    const cdpManagerContract = new CdpManagerContract(
      DaiMinting.getDaiMintingInfoForNetwork(networkName).CDP_MANAGER,
    );

    const addCollateralTransaction = await cdpManagerContract.addCollateral(
      this.cdpId,
      this.collateralAmount,
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

    return {
      crossContractCalls: [addCollateralTransaction],
      outputERC20Amounts: [...erc20Amounts, mintedDaiToken],
      outputNFTs: [...input.nfts],
    };
  }
}
