import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CreateAccessCardRecipe } from '../create-access-card-recipe';
import { RecipeInput } from '../../../models/export-models';
import {
  NETWORK_CONFIG,
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

describe('create-access-card-recipe', () => {
  before(() => {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('Should create create-access-card-recipe', async () => {
    const recipe = new CreateAccessCardRecipe(encryptedNftData);

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [],
      nfts: [],
    };

    const output = await recipe.getRecipeOutput(recipeInput);

    expect(output.nftRecipients).to.deep.equal([
      {
        amount: 0n,
        nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
        nftTokenType: NFTTokenType.ERC721,
        owns: undefined,
        recipient: MOCK_RAILGUN_WALLET_ADDRESS,
        tokenSubID: '0',
      },
    ]);

    expect(output.feeERC20AmountRecipients.length).to.equal(0);
    expect(output.erc20AmountRecipients.length).to.equal(0);

    expect(output.stepOutputs.length).to.equal(4);

    expect(output.stepOutputs[0]).to.deep.equal({
      name: 'Unshield (Default)',
      description: 'Unshield ERC20s and NFTs from private RAILGUN balance.',
      crossContractCalls: [],
      outputERC20Amounts: [],
      outputNFTs: [],
      feeERC20AmountRecipients: [],
    });

    expect(output.stepOutputs[1]).to.deep.equal({
      name: 'Access Card NFT Mint',
      description:
        'Mints an Access Card NFT, which can be assigned as owner to a Mech or Safe',
      crossContractCalls: [
        {
          // todo: This data will change once actual contracts are deployed to ethereum
          data: '0x7ba0e2e70000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001d4d594d3e82f43d8e97bb70cb9c6d4a3e2f57a1f43966a4017fdbeae708000000',
          to: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
        },
      ],
      outputERC20Amounts: [],
      // tokenSubID: 0 and amount: 0n indicates that the ID and amount is unknown.
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: '0',
          amount: 0n,
          owns: undefined,
        },
      ],
    });

    expect(output.stepOutputs[2]).to.deep.equal({
      name: 'Access Card Create NFT Owner',
      description: 'Creates an Ownable Contract for a user',
      crossContractCalls: [
        {
          data: '0x5596d148',
          to: NETWORK_CONFIG[networkName].relayAdaptContract,
        },
      ],
      outputERC20Amounts: [],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: '0',
          amount: 0n,
          owns: undefined,
        },
      ],
    });

    expect(output.stepOutputs[3]).to.deep.equal({
      name: 'Shield (Default)',
      description: 'Shield ERC20s and NFTs into private RAILGUN balance.',
      crossContractCalls: [],
      feeERC20AmountRecipients: [],
      outputERC20Amounts: [],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: '0',
          amount: 0n,
          owns: undefined,
        },
      ],
    });
  });
});
