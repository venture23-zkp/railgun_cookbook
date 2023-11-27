import { CdpManagerContract } from 'contract/dai-minting/cdp-manager-contract';
import { StepConfig, StepInput, UnvalidatedStepOutput } from '../../models';
import { Step } from '../step';
import { DaiMinting } from 'api/dai-minting';
import { convertToIlk } from '../../utils';

export class DaiOpenVaultStep extends Step {
  readonly config: StepConfig = {
    name: 'Dai - Open vault',
    description: 'Open a vault using CDP manager for DAI minting',
  };

  private readonly tokenAdapterIlkName: string;
  private readonly vaultOwnerAddress: string;

  constructor(tokenAdapterIlkName: string, vaultOwnerAddress: string) {
    super();
    this.tokenAdapterIlkName = tokenAdapterIlkName;
    this.vaultOwnerAddress = vaultOwnerAddress;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const { networkName } = input;

    const cdpManagerContract = new CdpManagerContract(
      DaiMinting.getDaiMintingInfoForNetwork(networkName).CDP_MANAGER,
    );

    const computedIlk = convertToIlk(this.tokenAdapterIlkName);
    const openVaultTransaction = await cdpManagerContract.openVault(
      computedIlk,
      this.vaultOwnerAddress,
    );

    return {
      crossContractCalls: [openVaultTransaction],
      outputERC20Amounts: [...input.erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
