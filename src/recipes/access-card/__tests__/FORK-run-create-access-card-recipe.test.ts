import { NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { RecipeInput } from '../../../models/export-models';
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
import {
  getTestEthersWallet,
} from '../../../test/shared.test';

import { AccessCardERC721Contract } from '../../../contract/access-card/access-card-erc721-contract';
import { AccessCardNFT } from '../../../api/access-card/access-card-nft';

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

    // { name: "", description: `memo 🙀🧞🧞a,
    //  🤡`}
    let encryptedNftData = "30326d656d6f20f09f9980f09fa79ef09fa79e612c0a202020202020f09fa4a1";

    const recipe = new CreateAccessCardRecipe(encryptedNftData);

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [],
      nfts: [],
    };

    const wallet = getTestEthersWallet();

    const { erc721: erc721Address } =
      AccessCardNFT.getAddressesForNetwork(networkName);
    const accessCardCtx = new AccessCardERC721Contract(erc721Address);
    const getTotalSupplyTxn = await accessCardCtx.getTotalSupply();

      const initialSupply = BigInt(
        await wallet.call(getTotalSupplyTxn),
      ) as bigint;

      const recipeOutput = await recipe.getRecipeOutput(recipeInput);
      await executeRecipeStepsAndAssertUnshieldBalances(
        recipe.config.name,
        recipeInput,
        recipeOutput,
      );

      const newSupply = BigInt(await wallet.call(getTotalSupplyTxn)) as bigint;

      expect(newSupply - initialSupply)
        .to.equal(1n);
  });
});
