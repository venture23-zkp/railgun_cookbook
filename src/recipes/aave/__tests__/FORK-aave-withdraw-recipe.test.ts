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
import { AaveV3WithdrawRecipe } from '../aave-withdraw-recipe';
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
import { createAccessCard, depositTokenToAave } from './aave-test-helpers';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

// todo: move unrelated test code to before block
describe('FORK-run-aave-withdraw-recipe', function run() {
  before(async function run() {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('[FORK] Should run aave-withdraw-recipe', async function run() {
    this.timeout(55_000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    const withdrawAmount = 10000000n;
    const nftTokenId = '0';

    const provider = getTestProvider();

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

    const aaveDepositTokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount: withdrawAmount,
      decimals: 6n,
      isBaseToken: false,
    };

    const withdrawAmountAfterDepositFee =
      withdrawAmount -
      (withdrawAmount * MOCK_SHIELD_FEE_BASIS_POINTS) / 10_000n;

    const aaveWithdrawTokenData: AaveV3TokenData = {
      ...aaveDepositTokenData,
      amount: withdrawAmountAfterDepositFee,
    };

    await createAccessCard(provider, networkName);
    console.debug('Access card created successfully\n');
    await delay(1000);
    await depositTokenToAave(
      provider,
      networkName,
      nftTokenId,
      aaveDepositTokenData,
      withdrawAmount,
      ownableAccountContract,
    );
    console.debug('ERC20 deposited to AAVEv3 Pool');
    await delay(1000);

    const recipe = new AaveV3WithdrawRecipe(
      aaveWithdrawTokenData,
      ownableAccountContract,
      withdrawAmountAfterDepositFee,
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

    const aTokenContract = new ERC20Contract(
      Aave.getAaveInfoForNetwork(networkName).usdc.aToken,
      provider,
    );

    const usdcContract = new ERC20Contract(
      testConfig.contractsEthereum.usdc,
      provider,
    );

    const initialProxyUsdcBalance = await usdcContract.balanceOf(
      NETWORK_CONFIG[networkName].proxyContract,
    );

    const initialOwnableAtokenBalance = await aTokenContract.balanceOf(
      ownableAccountContract,
    );

    await executeRecipeStepsAndAssertUnshieldBalances(
      recipe.config.name,
      recipeInput,
      recipeOutput,
      true,
      true,
    );

    // verify token balance update after withdraw

    const finalProxyUsdcBalance = await usdcContract.balanceOf(
      NETWORK_CONFIG[networkName].proxyContract,
    );

    const finalOwnableAtokenBalance = await aTokenContract.balanceOf(
      ownableAccountContract,
    );

    const usdcBalanceDifference =
      finalProxyUsdcBalance - initialProxyUsdcBalance;
    const aTokenBalanceDifference =
      initialOwnableAtokenBalance - finalOwnableAtokenBalance;

    const withdrawAmountAfterWithdrawFee =
      withdrawAmountAfterDepositFee -
      (withdrawAmountAfterDepositFee * MOCK_SHIELD_FEE_BASIS_POINTS) / 10_000n;

    // consider upto 100Wei more for interest calculation purposes
    expect(
      Number(usdcBalanceDifference - withdrawAmountAfterWithdrawFee),
    ).to.be.lessThanOrEqual(100);

    // consider upto 10wei difference in aToken balance
    expect(
      Number(withdrawAmountAfterDepositFee - aTokenBalanceDifference),
    ).to.be.lessThanOrEqual(10);
  });
});
