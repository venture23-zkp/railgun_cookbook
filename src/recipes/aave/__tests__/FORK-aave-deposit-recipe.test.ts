import {
  NETWORK_CONFIG,
  NFTTokenType,
  NetworkName,
  delay,
} from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3TokenData, RecipeInput } from '../../../models/export-models';
import { setRailgunFees } from '../../../init';
import { AaveV3DepositRecipe } from '../aave-deposit-recipe';
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

import { testConfig } from '../../../test/test-config.test';
import { Aave } from '../../../api/aave/aave';
import { AccessCardNFT } from '../../../api/access-card/access-card-nft';
import { ERC20Contract } from '../../../contract';
import { createAccessCard } from '../../access-card/__tests__/access-card-test-helpers';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

// todo: move unrelated test code to before block
describe.only('FORK-run-aave-deposit-recipe', function run() {
  before(async function run() {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('[FORK] Should run aave-deposit-recipe', async function run() {
    this.timeout(40_000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    const depositAmount = 10000000n;
    const nftTokenId = '0';

    const provider = getTestProvider();

    await createAccessCard(provider, networkName);
    console.debug('Access card created successfully\n');
    await delay(1000);

    const aaveTokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount: depositAmount,
      decimals: 6n,
      isBaseToken: false,
    };

    const {
      defaultAccount: defaultAccountContract,
      defaultRegistry: defaultRegistryContract,
      erc721: accessCardErc721Address,
    } = AccessCardNFT.getAddressesForNetwork(networkName);

    const ownableAccountContract =
      await AccessCardNFT.getOwnableContractAddress(
        defaultRegistryContract, // registry contract
        defaultAccountContract, // default account
        nftTokenId, // token ID
        networkName,
        provider,
      );

    const recipe = new AaveV3DepositRecipe(
      aaveTokenData,
      ownableAccountContract,
      depositAmount,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [
        {
          recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
          ...aaveTokenData,
          amount: depositAmount,
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

    // verify the interest token on wallet
    const aTokenContract = new ERC20Contract(
      Aave.getAaveInfoForNetwork(networkName).usdc.aToken,
      provider,
    );

    const aTokenBalance = await aTokenContract.balanceOf(
      ownableAccountContract,
    );

    const actualDepositedAmount =
      depositAmount - (MOCK_SHIELD_FEE_BASIS_POINTS * depositAmount) / 10_000n;

    // +- 10 for interest calculation
    expect(Number(aTokenBalance - actualDepositedAmount)).to.be.lessThanOrEqual(10);
  });
});
