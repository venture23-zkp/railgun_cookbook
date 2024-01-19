import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { UpdateAccessCardMetadataRecipe } from '../update-access-card-metadata-recipe';
import { RecipeInput } from '../../../models/export-models';
import {
  NFTTokenType,
  NetworkName,
} from '@railgun-community/shared-models';
import { setRailgunFees } from '../../../init';
import {
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_SHIELD_FEE_BASIS_POINTS,
  MOCK_UNSHIELD_FEE_BASIS_POINTS,
} from '../../../test/mocks.test';
import { AccessCardNFT } from '../../../api/access-card/access-card-nft';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;
//{ name: 'name 1', description: 'description 1' }
const encryptedNftData =
  '4d594d3e82f43d8e97bb70cb9c6d4a3e2f57a1f43966a4017fdbeae708';
const nftTokenSubID = '11';

describe('update-access-card-metadata-recipe', () => {
  before(() => {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('Should create update-access-card-metadata-recipe', async () => {
    const recipe = new UpdateAccessCardMetadataRecipe(
      encryptedNftData,
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

    const output = await recipe.getRecipeOutput(recipeInput);

    expect(output.nftRecipients).to.deep.equal([
      {
        nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
        nftTokenType: NFTTokenType.ERC721,
        tokenSubID: nftTokenSubID,
        amount: 1n,
        recipient: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ]);

    expect(output.feeERC20AmountRecipients.length).to.equal(0);
    expect(output.erc20AmountRecipients.length).to.equal(0);

    expect(output.stepOutputs.length).to.equal(3);

    expect(output.stepOutputs[0]).to.deep.equal({
      name: 'Unshield (Default)',
      description: 'Unshield ERC20s and NFTs from private RAILGUN balance.',
      crossContractCalls: [],
      outputERC20Amounts: [],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenSubID,
          amount: 1n,
          recipient: MOCK_RAILGUN_WALLET_ADDRESS,
        },
      ],
      feeERC20AmountRecipients: [],
    });

    expect(output.stepOutputs[1]).to.deep.equal({
      name: 'Access Card Set NFT Metadata',
      description: 'Set Name and Description for the Access Card NFT as owner',
      crossContractCalls: [
        {
          // todo: This data will change once actual contracts are deployed to ethereum
          data: '0x13c58d68000000000000000000000000000000000000000000000000000000000000000b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001d4d594d3e82f43d8e97bb70cb9c6d4a3e2f57a1f43966a4017fdbeae708000000',
          to: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
        },
      ],
      outputERC20Amounts: [],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenSubID,
          amount: 1n,
          recipient: MOCK_RAILGUN_WALLET_ADDRESS,
        },
      ],
    });

    expect(output.stepOutputs[2]).to.deep.equal({
      name: 'Shield (Default)',
      description: 'Shield ERC20s and NFTs into private RAILGUN balance.',
      crossContractCalls: [],
      feeERC20AmountRecipients: [],
      outputERC20Amounts: [],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenSubID,
          amount: 1n,
          recipient: MOCK_RAILGUN_WALLET_ADDRESS,
        },
      ],
    });
  });

  it('Should fail update-access-card-metadata-recipe without NFT info', async () => {
    const recipe = new UpdateAccessCardMetadataRecipe(
      encryptedNftData,
      nftTokenSubID,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [],
      nfts: [],
    };

    await expect(recipe.getRecipeOutput(recipeInput)).to.eventually.be.rejectedWith(
      'Access Card Set NFT Metadata step is invalid. Access Card NFT information is required for the update',
    );
  });
});
