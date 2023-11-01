import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3DepositRecipe } from '../aave-deposit-recipe';
import { AaveV3TokenData, RecipeInput } from '../../../models/export-models';
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
import { testConfig } from '../../../test/test-config.test';
import {
  getUnshieldFee,
  getUnshieldedAmountAfterFee,
} from '../../../utils/fee';
import { Aave } from '../../../api';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;
const ownableContractAddress = '0x12fdB15Bc1B52EdD68169AF350e6deD8E5599134'; // random address
const depositAmount = 1_000000n;
const nftTokenId = '0';

describe('aave-deposit-recipe', () => {
  before(() => {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('Should create aave-deposit-recipe without explicit amount in aaveTokenData', async () => {
    const aaveTokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount: undefined,
      decimals: 6n,
    };

    const recipe = new AaveV3DepositRecipe(
      aaveTokenData,
      ownableContractAddress,
      depositAmount,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [
        {
          recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
          ...aaveTokenData,
          amount: depositAmount,
        },
      ],
      nfts: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          amount: 1n,
          tokenSubID: nftTokenId,
          nftTokenType: NFTTokenType.ERC721,
        },
      ],
    };

    const output = await recipe.getRecipeOutput(recipeInput);

    expect(output.nftRecipients).to.deep.equal([
      {
        nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
        nftTokenType: NFTTokenType.ERC721,
        tokenSubID: nftTokenId,
        amount: 1n,
        recipient: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ]);

    expect(output.feeERC20AmountRecipients).to.deep.equal([
      {
        tokenAddress: aaveTokenData.tokenAddress,
        amount: getUnshieldFee(networkName, depositAmount),
        recipient: 'RAILGUN Unshield Fee',
        decimals: aaveTokenData.decimals,
      },
    ]);

    expect(
      output.erc20AmountRecipients.map(({ tokenAddress }) => tokenAddress),
    ).to.deep.equal(
      [aaveTokenData.tokenAddress].map(tokenAddress =>
        tokenAddress.toLowerCase(),
      ),
    );

    expect(output.stepOutputs.length).to.equal(5);

    // todo: `data` value changes when using actual ethereum deployed contract address
    expect(output.crossContractCalls).to.deep.equal([
      {
        to: NETWORK_CONFIG[networkName].relayAdaptContract,
        data: '0xc2e9ffd8000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012fdb15bc1b52edd68169af350e6ded8e559913400000000000000000000000000000000000000000000000000000000000f387c',
      },
      {
        to: ownableContractAddress,
        data: '0x9e5d4c49000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000087870bca3f3fd6335c3f4ce8392d69350b4fa4e200000000000000000000000000000000000000000000000000000000000f387c00000000000000000000000000000000000000000000000000000000',
      },
      {
        to: ownableContractAddress,
        data: '0x9e5d4c4900000000000000000000000087870bca3f3fd6335c3f4ce8392d69350b4fa4e2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000084617ba037000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000f387c00000000000000000000000012fdb15bc1b52edd68169af350e6ded8e5599134000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      },
    ]);

    expect(output.stepOutputs[0]).to.deep.equal({
      name: 'Unshield (Default)',
      description: 'Unshield ERC20s and NFTs from private RAILGUN balance.',
      crossContractCalls: [],
      outputERC20Amounts: [
        {
          tokenAddress: aaveTokenData.tokenAddress,
          decimals: aaveTokenData.decimals,
          expectedBalance: getUnshieldedAmountAfterFee(
            networkName,
            depositAmount,
          ),
          minBalance: getUnshieldedAmountAfterFee(networkName, depositAmount),
          approvedSpender: undefined,
          isBaseToken: undefined,
        },
      ],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenId,
          amount: 1n,
        },
      ],
      feeERC20AmountRecipients: [
        {
          tokenAddress: aaveTokenData.tokenAddress,
          amount: getUnshieldFee(networkName, depositAmount),
          recipient: 'RAILGUN Unshield Fee',
          decimals: aaveTokenData.decimals,
        },
      ],
    });

    expect(output.stepOutputs[1]).to.deep.equal({
      name: 'Transfer ERC20',
      description: 'Transfers ERC20 token to an external public address.',
      crossContractCalls: [
        {
          to: NETWORK_CONFIG[networkName].relayAdaptContract,
          // todo: `data` value changes after using actual deployed ethereum contracts
          data: '0xc2e9ffd8000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012fdb15bc1b52edd68169af350e6ded8e559913400000000000000000000000000000000000000000000000000000000000f387c',
        },
      ],
      outputERC20Amounts: [],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenId,
          amount: 1n,
        },
      ],
      spentERC20Amounts: [
        {
          tokenAddress: aaveTokenData.tokenAddress,
          decimals: aaveTokenData.decimals,
          amount: getUnshieldedAmountAfterFee(networkName, depositAmount),
          recipient: ownableContractAddress,
        },
      ],
    });

    expect(output.stepOutputs[2]).to.deep.equal({
      name: 'AAVEv3 Approval',
      description: 'Approves the specified ERC20 token to Aave V3 via AC',
      crossContractCalls: [
        {
          to: ownableContractAddress,
          // todo: `data` value changes after using actual deployed ethereum contracts
          data: '0x9e5d4c49000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000087870bca3f3fd6335c3f4ce8392d69350b4fa4e200000000000000000000000000000000000000000000000000000000000f387c00000000000000000000000000000000000000000000000000000000',
        },
      ],
      outputERC20Amounts: [
        {
          tokenAddress: aaveTokenData.tokenAddress,
          decimals: aaveTokenData.decimals,
          expectedBalance: getUnshieldedAmountAfterFee(
            networkName,
            depositAmount,
          ),
          minBalance: getUnshieldedAmountAfterFee(networkName, depositAmount),
          approvedSpender: Aave.getAaveInfoForNetwork(networkName).AavePoolV3,
          isBaseToken: undefined,
        },
      ],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenId,
          amount: 1n,
        },
      ],
    });

    expect(output.stepOutputs[3]).to.deep.equal({
      name: 'AAVEv3 Deposit',
      description: 'Deposits the specified ERC20 token to Aave V3 via AC',
      crossContractCalls: [
        {
          to: ownableContractAddress,
          // todo: `data` value changes after using actual deployed ethereum contracts
          data: '0x9e5d4c4900000000000000000000000087870bca3f3fd6335c3f4ce8392d69350b4fa4e2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000084617ba037000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000f387c00000000000000000000000012fdb15bc1b52edd68169af350e6ded8e5599134000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        },
      ],
      outputERC20Amounts: [],
      spentERC20Amounts: [
        {
          tokenAddress: aaveTokenData.tokenAddress,
          decimals: aaveTokenData.decimals,
          amount: getUnshieldedAmountAfterFee(networkName, depositAmount),
          recipient: ownableContractAddress,
        },
      ],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenId,
          amount: 1n,
        },
      ],
    });

    expect(output.stepOutputs[4]).to.deep.equal({
      name: 'Shield (Default)',
      description: 'Shield ERC20s and NFTs into private RAILGUN balance.',
      crossContractCalls: [],
      outputERC20Amounts: [],
      outputNFTs: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenId,
          amount: 1n,
        },
      ],
      feeERC20AmountRecipients: [],
    });
  });
});
