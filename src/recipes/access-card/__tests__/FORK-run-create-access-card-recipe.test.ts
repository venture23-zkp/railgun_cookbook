import { NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { RecipeERC20Info, RecipeInput } from '../../../models/export-models';
import { setRailgunFees } from '../../../init';
import { CreateAccessCardRecipe } from '../create-access-card-recipe';
import {
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_SHIELD_FEE_BASIS_POINTS,
  MOCK_UNSHIELD_FEE_BASIS_POINTS,
} from '../../../test/mocks.test';
import {
  executeRecipeStepsAndAssertUnshieldBalances,
  shouldSkipForkTest,
} from '../../../test/common.test';
import { getTestRailgunWallet } from '../../../test/shared.test';


import { AccessCard } from "../engine-code/access-card-encrypt";


chai.use(chaiAsPromised);
const { expect } = chai;

// todo: Use fork instead
const networkName = NetworkName.Ethereum;

const nftMetadata = {
  name: 'Test nft name',
  description: 'This is test description of the test NFT ',
};

describe('FORK-run-create-access-card-recipe', function run() {
  this.timeout(240_000);

  before(async function run() {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('[FORK] Should run create-access-card-recipe', function run(done) {
    this.timeout(200_000);
    // if(shouldSkipForkTest(networkName)) {
    //   this.skip();
    // }


    const railgunWallet = getTestRailgunWallet();
    const sender = railgunWallet.getViewingKeyPair();

    let encryptedNftData =
      AccessCard.encryptCardInfo({name: 'n', description: 'd'}, sender.privateKey);

    if(encryptedNftData.length < 64) {
      const prefix = '0x' + Array(64 - encryptedNftData.length).fill(0).join("");
      encryptedNftData = prefix + encryptedNftData;
    }

    const recipe = new CreateAccessCardRecipe(encryptedNftData);

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [
        {
          tokenAddress: '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D', // rail token
          decimals: 18n,
          amount: 1n,
        },
      ],
      nfts: [],
    };

    recipe
      .getRecipeOutput(recipeInput)
      .then(recipeOutput => {
        executeRecipeStepsAndAssertUnshieldBalances(
          recipe.config.name,
          recipeInput,
          recipeOutput,
        )
          .then(x => {
            console.log('finished');
            expect(x === undefined).to.equal(true);
            done();
          })
          .catch(done);
      })
      .catch(done);
  });
});
