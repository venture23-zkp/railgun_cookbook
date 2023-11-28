import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { DaiOpenVaultRecipe } from '../dai-open-vault-recipe';
import {
  DaiMintingCollateralInfo,
  RecipeInput,
} from '../../../models/export-models';
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
  getShieldFee,
  getUnshieldFee,
  getUnshieldedAmountAfterFee,
} from '../../../utils/fee';
import { DaiMinting } from '../../../api/dai-minting';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;
const ownableContractAddress = '0x12fdB15Bc1B52EdD68169AF350e6deD8E5599134'; // random address
const collateralAmount = 1_00000000n;
const nftTokenId = '0';

describe.only('dai-open-vault-recipe', () => {
  before(() => {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  it('Should create dai-open-vault-recipe', async () => {
    const { CDP_MANAGER: cdpManagerAddress, WBTC } =
      DaiMinting.getDaiMintingInfoForNetwork(networkName);

    const wbtcTokenInfo: DaiMintingCollateralInfo = {
      tokenAddress: testConfig.contractsEthereum.wbtc,
      decimals: WBTC.DECIMALS,
      tokenSymbol: 'WBTC',
    };

    const recipe = new DaiOpenVaultRecipe(
      ownableContractAddress,
      collateralAmount,
      wbtcTokenInfo,
    );

    const recipeInput: RecipeInput = {
      railgunAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      networkName,
      erc20Amounts: [
        {
          ...wbtcTokenInfo,
          recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
          amount: collateralAmount,
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
        tokenAddress: wbtcTokenInfo.tokenAddress,
        amount: getShieldFee(networkName, collateralAmount),
        recipient: 'RAILGUN Unshield Fee',
        decimals: wbtcTokenInfo.decimals,
      },
    ]);

    expect(
      output.erc20AmountRecipients.map(({ tokenAddress }) => tokenAddress),
    ).to.deep.equal(
      [wbtcTokenInfo.tokenAddress].map(tokenAddress =>
        tokenAddress.toLowerCase(),
      ),
    );

    expect(output.stepOutputs.length).to.equal(5);

    // todo: `data` value changes when using actual ethereum deployed contract address
    expect(output.crossContractCalls).to.deep.equal([
      {
        to: NETWORK_CONFIG[networkName].relayAdaptContract,
        data: '0xc2e9ffd80000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012fdb15bc1b52edd68169af350e6ded8e55991340000000000000000000000000000000000000000000000000000000005f21070',
      },
      {
        to: ownableContractAddress,
        data: '0x9e5d4c490000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000bf72da2bd84c5170618fbe5914b0eca9638d5eb50000000000000000000000000000000000000000000000000000000005f2107000000000000000000000000000000000000000000000000000000000',
      },
      {
        to: cdpManagerAddress,
        data: '0x6090dec5574254432d41000000000000000000000000000000000000000000000000000000000000000000000000000012fdb15bc1b52edd68169af350e6ded8e5599134',
      },
    ]);

    expect(output.stepOutputs[0]).to.deep.equal({
      name: 'Unshield (Default)',
      description: 'Unshield ERC20s and NFTs from private RAILGUN balance.',
      crossContractCalls: [],
      outputERC20Amounts: [
        {
          approvedSpender: undefined,
          decimals: WBTC.DECIMALS,
          expectedBalance: getUnshieldedAmountAfterFee(
            networkName,
            collateralAmount,
          ),
          isBaseToken: undefined,
          minBalance: getUnshieldedAmountAfterFee(
            networkName,
            collateralAmount,
          ),
          tokenAddress: WBTC.ERC20,
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
          amount: getUnshieldFee(networkName, collateralAmount),
          decimals: WBTC.DECIMALS,
          recipient: 'RAILGUN Unshield Fee',
          tokenAddress: WBTC.ERC20,
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
          data: '0xc2e9ffd80000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012fdb15bc1b52edd68169af350e6ded8e55991340000000000000000000000000000000000000000000000000000000005f21070',
        },
      ],
      outputERC20Amounts: [],
      spentERC20Amounts: [
        {
          amount: getUnshieldedAmountAfterFee(networkName, collateralAmount),
          decimals: wbtcTokenInfo.decimals,
          recipient: ownableContractAddress,
          tokenAddress: WBTC.ERC20,
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
      name: 'Dai Minting Approval',
      description:
        'Approves the specified ERC20 token to its adapter contract via AC',
      crossContractCalls: [
        {
          to: ownableContractAddress,
          // todo: `data` value changes after using actual deployed ethereum contracts
          data: '0x9e5d4c490000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000bf72da2bd84c5170618fbe5914b0eca9638d5eb50000000000000000000000000000000000000000000000000000000005f2107000000000000000000000000000000000000000000000000000000000',
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
    });

    expect(output.stepOutputs[3]).to.deep.equal({
      name: 'Dai - Open vault',
      description: 'Open a vault using CDP manager for DAI minting',
      crossContractCalls: [
        {
          to: cdpManagerAddress,
          // todo: `data` value changes after using actual deployed ethereum contracts
          data: '0x6090dec5574254432d41000000000000000000000000000000000000000000000000000000000000000000000000000012fdb15bc1b52edd68169af350e6ded8e5599134',
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
