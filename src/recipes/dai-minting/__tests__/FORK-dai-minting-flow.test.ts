import {
  NETWORK_CONFIG,
  NFTTokenType,
  NetworkName,
  delay,
} from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { setRailgunFees } from '../../../init';
import {
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_SHIELD_FEE_BASIS_POINTS,
  MOCK_UNSHIELD_FEE_BASIS_POINTS,
} from '../../../test/mocks.test';
import {
  executeRecipeStepsAndAssertUnshieldBalances,
  shouldSkipForkTest,
} from '../../../test/common.test';
import { getTestProvider } from '../../../test/shared.test';
import { createAccessCard } from '../../access-card/__tests__/access-card-test-helpers';
import { MintDaiRecipe } from '../mint-dai-recipe';
import { DaiOpenVaultRecipe } from '../dai-open-vault-recipe';
import { AccessCardNFT } from '../../../api';
import { DaiMintingCollateralInfo, RecipeInput } from '../../../models';
import { DaiMinting } from '../../../api/dai-minting';
import { CdpManagerContract } from '../../../contract/dai-minting/cdp-manager-contract';
import { McdVatContract } from '../../../contract/dai-minting/mcd-vat-contract';
import { convertToIlk } from '../../../utils';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('FORK-run-dai-minting-flow', function run() {
  const { WBTC, CDP_MANAGER, MCD_VAT } =
    DaiMinting.getDaiMintingInfoForNetwork(networkName);

  const {
    defaultAccount: defaultAccountContract,
    defaultRegistry: defaultRegistryContract,
    erc721: accessCardErc721Address,
  } = AccessCardNFT.getAddressesForNetwork(networkName);

  const nftTokenId = '0';
  const collateralAmount = 1_00000000n; // 1 WBTC
  const collateralTokenInfo: DaiMintingCollateralInfo = {
    tokenAddress: WBTC.ERC20,
    decimals: WBTC.DECIMALS,
    tokenSymbol: 'WBTC',
  };

  let vaultAddress: string;
  let cdpId: bigint;
  let ownableAccountContract: string;

  before(async function run() {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('[FORK] Should run dai-open-vault-recipe', async function run() {
    this.timeout(555_000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    const provider = getTestProvider();

    await createAccessCard(provider, networkName);
    console.debug('Access card created successfully\n');
    await delay(1000);

    ownableAccountContract = await AccessCardNFT.getOwnableContractAddress(
      defaultRegistryContract,
      defaultAccountContract,
      nftTokenId,
      networkName,
      provider,
    );

    const recipe = new DaiOpenVaultRecipe(
      ownableAccountContract,
      collateralAmount,
      collateralTokenInfo,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [
        {
          ...collateralTokenInfo,
          recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
          amount: collateralAmount,
        },
      ],
      nfts: [
        {
          nftAddress: accessCardErc721Address,
          amount: 1n,
          tokenSubID: nftTokenId,
          nftTokenType: NFTTokenType.ERC721,
        },
      ],
    };

    const recipeOutput = await recipe.getRecipeOutput(recipeInput);

    await executeRecipeStepsAndAssertUnshieldBalances(
      recipe.config.name,
      recipeInput,
      recipeOutput,
      true,
      true,
    );

    // get and set vault address
    const cdpManagerContract = new CdpManagerContract(CDP_MANAGER, provider);
    cdpId = (await cdpManagerContract.getLastCdpId(ownableAccountContract))[0];
    vaultAddress = (await cdpManagerContract.getVaultAddressByCdpId(cdpId))[0];
  });

  it('[FORK] Should run mint-dai-recipe', async function run() {
    this.timeout(555_000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    const provider = getTestProvider();

    const daiMintAmount = 10_000_000_000_000_000_000n; // 10 dai

    const mcdVatContract = new McdVatContract(MCD_VAT, provider);
    const tokenIlk = convertToIlk(WBTC.ADAPTER_ILK_NAME);
    const currentIlkRate = (await mcdVatContract.getIlkInfo(tokenIlk))[1];

    const recipe = new MintDaiRecipe(
      ownableAccountContract,
      daiMintAmount,
      collateralTokenInfo,
      collateralAmount,
      currentIlkRate,
      vaultAddress,
      cdpId,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [],
      nfts: [
        {
          nftAddress: accessCardErc721Address,
          amount: 1n,
          tokenSubID: nftTokenId,
          nftTokenType: NFTTokenType.ERC721,
        },
      ],
    };

    const recipeOutput = await recipe.getRecipeOutput(recipeInput);

    await executeRecipeStepsAndAssertUnshieldBalances(
      recipe.config.name,
      recipeInput,
      recipeOutput,
      true,
      true,
    );
  });
});
