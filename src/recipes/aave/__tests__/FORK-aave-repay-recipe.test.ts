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
import { AaveV3RepayRecipe } from '../aave-repay-recipe';
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
import {
  borrowTokenFromAave,
  createAccessCard,
  depositTokenToAave,
} from './aave-test-helpers';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

// todo: move unrelated test code to before block
describe('FORK-run-aave-repay-recipe', function run() {
  before(async function run() {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('[FORK] Should run aave-repay-recipe', async function run() {
    this.timeout(940_000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    const depositAmount = 10_000000n;
    const nftTokenId = '0';
    const borrowRepayAmount = 3_000000n;

    const provider = getTestProvider();

    const aaveDepositTokenData: AaveV3TokenData = {
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

    await createAccessCard(provider, networkName);
    console.debug('Access card created successfully\n');
    await delay(1000);
    await depositTokenToAave(
      provider,
      networkName,
      nftTokenId,
      aaveDepositTokenData,
      ownableAccountContract,
    );
    console.debug('USDC deposited to AAVEv3 Pool');
    await delay(1000);

    const aaveBorrowRepayTokenData = {
      ...aaveDepositTokenData,
      amount: borrowRepayAmount,
    };
    await borrowTokenFromAave(
      provider,
      networkName,
      nftTokenId,
      aaveBorrowRepayTokenData,
      ownableAccountContract,
      2,
      0,
    );
    console.debug('USDC borrowed from AAVEv3 Pool');
    await delay(1000);

    const dTokenContract = new ERC20Contract(
      Aave.getAaveInfoForNetwork(networkName).usdc.variableDToken,
      provider,
    );
    const usdcContract = new ERC20Contract(
      testConfig.contractsEthereum.usdc,
      provider,
    );
    const aTokenContract = new ERC20Contract(
      Aave.getAaveInfoForNetwork(networkName).usdc.aToken,
      provider,
    );

    const initialOwnableDtokenBalance = await dTokenContract.balanceOf(
      ownableAccountContract,
    );
    const initialProxyUsdcBalance = await usdcContract.balanceOf(
      NETWORK_CONFIG[networkName].proxyContract,
    );

    const recipe = new AaveV3RepayRecipe(
      aaveBorrowRepayTokenData,
      ownableAccountContract,
      2,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [
        {
          recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
          ...aaveBorrowRepayTokenData,
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

    // verify the erc20 and dtoken on wallet
    const finalProxyUsdcBalance = await usdcContract.balanceOf(
      NETWORK_CONFIG[networkName].proxyContract,
    );

    const finalOwnableDtokenBalance = await dTokenContract.balanceOf(
      ownableAccountContract,
    );

    const usdcBalanceDifference =
      initialProxyUsdcBalance - finalProxyUsdcBalance;
    const dTokenBalanceDifference =
      initialOwnableDtokenBalance - finalOwnableDtokenBalance;

    // todo: Correctly verify the usdc balance difference
    // expect(usdcBalanceDifference).to.equal(3000000n);
    expect(finalOwnableDtokenBalance).to.equal(borrowRepayAmount * MOCK_UNSHIELD_FEE_BASIS_POINTS / 10_000n);
  });
});
