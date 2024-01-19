import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3WithdrawRecipe } from '../aave-withdraw-recipe';
import { AaveV3TokenData, RecipeInput } from '../../../models/export-models';
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
import { testConfig } from '../../../test/test-config.test';
import {
  getShieldFee,
  getShieldedAmountAfterFee,
} from '../../../utils/fee';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;
const ownableContractAddress = '0x12fdB15Bc1B52EdD68169AF350e6deD8E5599134'; // random address
const withdrawAmount = 1_000000n;
const nftTokenId = '0';

describe('aave-withdraw-recipe', () => {
  before(() => {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('Should create aave-withdraw-recipe', async () => {
    const aaveTokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount: undefined,
      decimals: 6n,
    };

    const recipe = new AaveV3WithdrawRecipe(
      aaveTokenData,
      ownableContractAddress,
      withdrawAmount,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [],
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
        amount: getShieldFee(networkName, withdrawAmount),
        recipient: 'RAILGUN Shield Fee',
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

    expect(output.stepOutputs.length).to.equal(4);

    // todo: `data` value changes when using actual ethereum deployed contract address
    expect(output.crossContractCalls).to.deep.equal([
      {
        to: ownableContractAddress,
        data: '0x9e5d4c4900000000000000000000000087870bca3f3fd6335c3f4ce8392d69350b4fa4e200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000006469328dec000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000f424000000000000000000000000012fdb15bc1b52edd68169af350e6ded8e559913400000000000000000000000000000000000000000000000000000000',
      },
      {
        to: ownableContractAddress,
        data: '0x9e5d4c49000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000003ab4da0f8fa0e0bb3db60cee269c90ea296b9a5b00000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000',
      },
    ]);

    expect(output.stepOutputs[0]).to.deep.equal({
      name: 'Unshield (Default)',
      description: 'Unshield ERC20s and NFTs from private RAILGUN balance.',
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

    expect(output.stepOutputs[1]).to.deep.equal({
      name: 'AAVEv3 Withdraw',
      description:
        'Withdraws the specified ERC20 token from Aave V3 to Account Contract(AC)',
      crossContractCalls: [
        {
          to: ownableContractAddress,
          // todo: `data` value changes after using actual deployed ethereum contracts
          data: '0x9e5d4c4900000000000000000000000087870bca3f3fd6335c3f4ce8392d69350b4fa4e200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000006469328dec000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000f424000000000000000000000000012fdb15bc1b52edd68169af350e6ded8e559913400000000000000000000000000000000000000000000000000000000',
        },
      ],
      outputERC20Amounts: [
        {
          approvedSpender: undefined,
          decimals: aaveTokenData.decimals,
          expectedBalance: withdrawAmount,
          minBalance: withdrawAmount,
          tokenAddress: aaveTokenData.tokenAddress,
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

    expect(output.stepOutputs[2]).to.deep.equal({
      name: 'AAVEv3 ERC20 Transfer',
      description:
        'Transfers the specified ERC20 token from Account Contract(AC) to Relay Adapt',
      crossContractCalls: [
        {
          to: ownableContractAddress,
          // todo: `data` value changes after using actual deployed ethereum contracts
          data: '0x9e5d4c49000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000003ab4da0f8fa0e0bb3db60cee269c90ea296b9a5b00000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000',
        },
      ],
      outputERC20Amounts: [
        {
          tokenAddress: aaveTokenData.tokenAddress,
          decimals: aaveTokenData.decimals,
          expectedBalance: withdrawAmount,
          minBalance: withdrawAmount,
          approvedSpender: undefined,
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
      name: 'Shield (Default)',
      description: 'Shield ERC20s and NFTs into private RAILGUN balance.',
      crossContractCalls: [],
      outputERC20Amounts: [
        {
          tokenAddress: aaveTokenData.tokenAddress,
          decimals: aaveTokenData.decimals,
          expectedBalance: getShieldedAmountAfterFee(
            networkName,
            withdrawAmount,
          ),
          minBalance: getShieldedAmountAfterFee(networkName, withdrawAmount),
          approvedSpender: undefined,
          isBaseToken: undefined,
          recipient: undefined,
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
          amount: getShieldFee(networkName, withdrawAmount),
          decimals: aaveTokenData.decimals,
          recipient: 'RAILGUN Shield Fee',
          tokenAddress: aaveTokenData.tokenAddress,
        },
      ],
    });
  });
});
