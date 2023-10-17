import {
  NETWORK_CONFIG,
  NFTTokenType,
  NetworkName,
  RailgunNFTAmountRecipient,
} from '@railgun-community/shared-models';
import { hexlify } from '@railgun-community/wallet';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { RecipeInput } from '../../../models/export-models';
import { setRailgunFees } from '../../../init';
import { CreateAccessCardRecipe } from '../create-access-card-recipe';
import { UpdateAccessCardMetadataRecipe } from '../update-access-card-metadata-recipe';
import {
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_RAILGUN_WALLET_ADDRESS_2,
  MOCK_SHIELD_FEE_BASIS_POINTS,
  MOCK_UNSHIELD_FEE_BASIS_POINTS,
} from '../../../test/mocks.test';
import {
  executePrivateNftTransfer,
  executeRecipeStepsAndAssertUnshieldBalances,
  shouldSkipForkTest,
} from '../../../test/common.test';
import {
  getTestProvider,
  getTestRailgunWallet2,
} from '../../../test/shared.test';

import { AccessCardERC721Contract } from '../../../contract/access-card/access-card-erc721-contract';
import { AccessCardNFT } from '../../../api/access-card/access-card-nft';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('FORK-run-access-card-recipes', function run() {
  //{ name: 'name 1', description: 'description 1' }
  const encryptedNftData =
    '4d594d3e82f43d8e97bb70cb9c6d4a3e2f57a1f43966a4017fdbeae708';

  before(async function run() {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('[FORK] Should run create-access-card-recipe', async function run() {
    this.timeout(25_000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    const provider = getTestProvider();

    const { erc721: erc721Address } =
      AccessCardNFT.getAddressesForNetwork(networkName);
    const accessCardCtx = new AccessCardERC721Contract(erc721Address, provider);

    const recipe = new CreateAccessCardRecipe(encryptedNftData);

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [],
      nfts: [],
    };

    const initialSupply = (await accessCardCtx.getTotalSupply())[0];

    const recipeOutput = await recipe.getRecipeOutput(recipeInput);
    await executeRecipeStepsAndAssertUnshieldBalances(
      recipe.config.name,
      recipeInput,
      recipeOutput,
      true,
      true,
    );

    const newSupply = (await accessCardCtx.getTotalSupply())[0];

    expect(newSupply - initialSupply).to.equal(1n);
  });

  it('[FORK] Should retrieve the NFT metadata', async function run() {
    this.timeout(5000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    const provider = getTestProvider();

    const { erc721: erc721Address } =
      AccessCardNFT.getAddressesForNetwork(networkName);
    const accessCardCtx = new AccessCardERC721Contract(erc721Address, provider);

    // the minted nft metadata has tokenId 0n
    const storedMetadata = await accessCardCtx.getEncryptedMetadata(0n);

    expect(storedMetadata[0]).to.equal(hexlify(encryptedNftData, true));
  });

  // todo: Strangely this test case only passes only once when
  // 1. token id is '0' and
  // 2. the minting and update test cases are run sequentially, right after one another
  it('[FORK] Should run update-access-card-metadata-recipe', async function run() {
    this.timeout(25_000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    const provider = getTestProvider();

    const { erc721: erc721Address } =
      AccessCardNFT.getAddressesForNetwork(networkName);
    const accessCardCtx = new AccessCardERC721Contract(erc721Address, provider);

    const updatedEncryptedMetadata = '5a389f3e0b09395930291029495010';
    const nftTokenSubID = '0';

    const recipe = new UpdateAccessCardMetadataRecipe(
      updatedEncryptedMetadata,
      nftTokenSubID,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [],
      nfts: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenSubID,
          amount: 1n,
          recipient: MOCK_RAILGUN_WALLET_ADDRESS,
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

    const finalMetadata = await accessCardCtx.getEncryptedMetadata(0n);

    expect(finalMetadata).to.deep.equal([
      hexlify(updatedEncryptedMetadata, true),
    ]);
  });

  // todo: This test case fails
  it('[FORK] Should transfer access card to another user', async function () {
    this.timeout(25_000);
    if (shouldSkipForkTest(networkName)) {
      this.skip();
    }

    // the first minted access card id is zero
    const tokenSubID = '0';

    const nftRecipients: RailgunNFTAmountRecipient = {
      nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
      nftTokenType: NFTTokenType.ERC721,
      tokenSubID: tokenSubID,
      amount: 1n,
      recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS_2,
    };

    await executePrivateNftTransfer(
      'Transfer access card ERC721',
      networkName,
      [nftRecipients],
    );

    const wallet2 = getTestRailgunWallet2();
    const wallet2TreeBalance = Object.values(
      await wallet2.balancesByTree(NETWORK_CONFIG[networkName].chain),
    );

    expect(wallet2TreeBalance[0][0].balance).to.equal(1n);
    expect(wallet2TreeBalance[0][0].tokenData).to.deep.equal({
      tokenAddress:
        AccessCardNFT.getAddressesForNetwork(networkName).erc721.toLowerCase(),
      tokenType: NFTTokenType.ERC721,
      tokenSubID: hexlify(''.padStart(64, '0'), true),
    });
  });
});
