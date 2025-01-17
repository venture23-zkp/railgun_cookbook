import { JsonRpcProvider } from 'ethers';
import { CreateAccessCardRecipe } from '../../access-card/create-access-card-recipe';
import { AaveV3TokenData, RecipeInput } from '../../../models';
import { MOCK_RAILGUN_WALLET_ADDRESS } from '../../../test/mocks.test';
import {
  NETWORK_CONFIG,
  NFTTokenType,
  NetworkName,
} from '@railgun-community/shared-models';
import { executeRecipeStepsAndAssertUnshieldBalances } from '../../../test/common.test';
import { AaveV3DepositRecipe } from '../aave-deposit-recipe';
import { AccessCardNFT } from '../../../api';
import { AaveV3BorrowRecipe } from '../aave-borrow-recipe';

export async function createAccessCard(
  provider: JsonRpcProvider,
  networkName: NetworkName,
) {
  //{ name: 'name 1', description: 'description 1' }
  const encryptedNftData =
    '4d594d3e82f43d8e97bb70cb9c6d4a3e2f57a1f43966a4017fdbeae708';

  const recipe = new CreateAccessCardRecipe(encryptedNftData);

  const recipeInput: RecipeInput = {
    railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
    networkName,
    erc20Amounts: [],
    nfts: [],
  };

  const recipeoutput = await recipe.getRecipeOutput(recipeInput);
  await executeRecipeStepsAndAssertUnshieldBalances(
    recipe.config.name,
    recipeInput,
    recipeoutput,
    true,
    true,
  );
}

export async function depositTokenToAave(
  provider: JsonRpcProvider,
  networkName: NetworkName,
  nftTokenId: string,
  aaveTokenData: AaveV3TokenData,
  depositAmount: bigint,
  ownableAccountContract: string,
) {
  const { erc721: accessCardErc721Address } =
    AccessCardNFT.getAddressesForNetwork(networkName);

  const recipe = new AaveV3DepositRecipe(aaveTokenData, ownableAccountContract, depositAmount);

  const recipeInput: RecipeInput = {
    railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
    networkName,
    erc20Amounts: [
      {
        recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
        ...aaveTokenData,
        amount: depositAmount
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
}

export async function borrowTokenFromAave(
  provider: JsonRpcProvider,
  networkName: NetworkName,
  nftTokenId: string,
  aaveBorrowTokenData: AaveV3TokenData,
  borrowAmount: bigint,
  ownableAccountContract: string,
  interestRateMode: number,
  referralCode: number,
) {
  const { erc721: accessCardErc721Address } =
    AccessCardNFT.getAddressesForNetwork(networkName);

  const recipe = new AaveV3BorrowRecipe(
    aaveBorrowTokenData,
    ownableAccountContract,
    borrowAmount,
    interestRateMode,
    referralCode,
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
}
