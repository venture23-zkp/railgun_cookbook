import { JsonRpcProvider } from "ethers";
import { CreateAccessCardRecipe } from "../../access-card/create-access-card-recipe";
import { RecipeInput } from "../../../models";
import { MOCK_RAILGUN_WALLET_ADDRESS } from "../../../test/mocks.test";
import { NetworkName } from "@railgun-community/shared-models";
import { executeRecipeStepsAndAssertUnshieldBalances } from "../../../test/common.test";

export async function createAccessCard(provider: JsonRpcProvider, networkName: NetworkName) {
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
