import { CdpManagerContract } from '../../contract/dai-minting/cdp-manager-contract';
import { StepConfig, StepInput, UnvalidatedStepOutput } from '../../models';
import { Step } from '../step';
import { DaiMinting } from '../../api/dai-minting';
import { convertToIlk } from '../../utils';
import { AccessCardOwnerAccountContract } from '../../contract/access-card/access-card-owner-account-contract';

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

    const { CDP_MANAGER } = DaiMinting.getDaiMintingInfoForNetwork(networkName);

    const cdpManagerContract = new CdpManagerContract(CDP_MANAGER);

    const ownableContract = new AccessCardOwnerAccountContract(
      this.vaultOwnerAddress,
    );

    const computedIlk = convertToIlk(this.tokenAdapterIlkName);
    const openVaultCalldata = await cdpManagerContract.openVault(
      computedIlk,
      this.vaultOwnerAddress,
    );

    const openVaultTransaction = await ownableContract.executeCall(
      CDP_MANAGER,
      openVaultCalldata.data,
      0n,
    );

    return {
      crossContractCalls: [openVaultTransaction],
      outputERC20Amounts: [...input.erc20Amounts],
      outputNFTs: [...input.nfts],
    };
  }
}
