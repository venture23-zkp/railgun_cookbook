import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ZeroXSwapRecipe } from '../zero-x-swap-recipe';
import { BigNumber } from 'ethers';
import {
  RecipeERC20Info,
  RecipeInput,
  SwapQuoteData,
} from '../../../models/export-models';
import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';
import { setRailgunFees } from '../../../init';
import { getTestRailgunWallet } from '../../../test/shared.test';
import {
  MOCK_SHIELD_FEE_BASIS_POINTS,
  MOCK_UNSHIELD_FEE_BASIS_POINTS,
} from '../../../test/mocks.test';
import { balanceForERC20Token } from '@railgun-community/quickstart';
import { ZeroXQuote } from '../../../api/zero-x';
import {
  executeRecipeStepsAndAssertUnshieldBalances,
  shouldSkipForkTest,
} from '../../../test/common.test';
import { ZeroXConfig } from '../../../models/zero-x-config';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;
const sellTokenAddress = NETWORK_CONFIG[networkName].baseToken.wrappedAddress;
const buyTokenAddress = '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D';

const sellToken: RecipeERC20Info = {
  tokenAddress: sellTokenAddress, // WETH
  decimals: 18,
  isBaseToken: false,
};

const buyToken: RecipeERC20Info = {
  tokenAddress: buyTokenAddress, // RAIL
  decimals: 18,
};

const slippagePercentage = 0.01;

describe('FORK-zero-x-swap-recipe', function run() {
  this.timeout(120000);

  before(async function run() {
    if (shouldSkipForkTest(networkName)) {
      this.skip();
      return;
    }

    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );

    ZeroXConfig.PROXY_API_DOMAIN = undefined;
  });

  it('[FORK] Should run zero-x-swap-recipe', async function run() {
    if (shouldSkipForkTest(networkName)) {
      this.skip();
      return;
    }

    const recipe = new ZeroXSwapRecipe(sellToken, buyToken, slippagePercentage);
    const recipeInput: RecipeInput = {
      networkName,
      erc20Amounts: [
        {
          tokenAddress: sellTokenAddress,
          decimals: 18,
          isBaseToken: false,
          amount: BigNumber.from('12000'),
        },
      ],
      nfts: [],
    };

    const railgunWallet = getTestRailgunWallet();
    const initialPrivateRAILBalance = await balanceForERC20Token(
      railgunWallet,
      networkName,
      buyToken.tokenAddress,
    );

    const recipeOutput = await recipe.getRecipeOutput(recipeInput);
    await executeRecipeStepsAndAssertUnshieldBalances(
      recipe.config.name,
      recipeInput,
      recipeOutput,
      2_800_000, // expectedGasWithin50K
    );

    const quote = recipe.getLatestQuote() as SwapQuoteData;
    expect(quote).to.not.be.undefined;
    const expectedSpender =
      ZeroXQuote.zeroXExchangeProxyContractAddress(networkName);
    expect(quote.spender).to.equal(
      expectedSpender,
      '0x Exchange contract does not match.',
    );

    // REQUIRED TESTS:

    // 1. Add New Private Balance expectations.
    // Expect new swapped token in private balance.

    const privateRAILBalance = await balanceForERC20Token(
      railgunWallet,
      networkName,
      buyToken.tokenAddress,
    );

    const minimumBuyAmount = quote.minimumBuyAmount;
    const minimumShieldFee = minimumBuyAmount
      .mul(MOCK_SHIELD_FEE_BASIS_POINTS)
      .div(10000);
    const expectedPrivateRAILBalance = initialPrivateRAILBalance
      .add(minimumBuyAmount) // Minimum buy amount
      .sub(minimumShieldFee); // Shield fee
    expect(privateRAILBalance.gte(expectedPrivateRAILBalance)).to.equal(
      true,
      'Private RAIL balance incorrect after swap',
    );

    // 2. Add External Balance expectations.
    // N/A
  });
});
