import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { MintDaiRecipe } from '../mint-dai-recipe';
import {
  DaiMintingCollateralInfo,
  RecipeInput,
} from '../../../models/export-models';
import { NFTTokenType, NetworkName } from '@railgun-community/shared-models';
import { setRailgunFees } from '../../../init';
import {
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_SHIELD_FEE_BASIS_POINTS,
  MOCK_UNSHIELD_FEE_BASIS_POINTS,
} from '../../../test/mocks.test';
import { AccessCardNFT } from '../../../api/access-card/access-card-nft';
import { testConfig } from '../../../test/test-config.test';
import { getShieldFee, getShieldedAmountAfterFee } from '../../../utils/fee';
import { DaiMinting } from '../../../api/dai-minting';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;
const ownableContractAddress = '0x12fdB15Bc1B52EdD68169AF350e6deD8E5599134'; // random address
const vaultAddress = '0x123d5ed9889ad2019e9ae967cddc4f36c052a302'; // random address
const cdpId = 5n; // random cdpId
const collateralAmount = 1_00000000n; // 1 WBTC
const currentIlkRate = 10n ** 27n; // random rate
const daiMintAmount = 1_000_000_000_000_000_000n; // 1 DAI
const nftTokenId = '0';

describe('mint-dai-recipe', () => {
  before(() => {
    setRailgunFees(
      networkName,
      MOCK_SHIELD_FEE_BASIS_POINTS,
      MOCK_UNSHIELD_FEE_BASIS_POINTS,
    );
  });

  // todo: Update expect cases after introducing Ilk rate
  it('Should create mint-dai-recipe', async () => {
    const {
      CDP_MANAGER: cdpManagerAddress,
      WBTC,
      DAI,
      MCD_VAT,
    } = DaiMinting.getDaiMintingInfoForNetwork(networkName);

    const wbtcTokenInfo: DaiMintingCollateralInfo = {
      tokenAddress: testConfig.contractsEthereum.wbtc,
      decimals: WBTC.DECIMALS,
      tokenSymbol: 'WBTC',
    };

    const recipe = new MintDaiRecipe(
      ownableContractAddress,
      daiMintAmount,
      wbtcTokenInfo,
      collateralAmount,
      currentIlkRate,
      vaultAddress,
      cdpId,
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
        tokenAddress: DAI.ERC20,
        amount: getShieldFee(networkName, daiMintAmount),
        recipient: 'RAILGUN Shield Fee',
        decimals: DAI.DECIMALS,
      },
    ]);

    expect(
      output.erc20AmountRecipients.map(({ tokenAddress }) => tokenAddress),
    ).to.deep.equal(
      [DAI.ERC20].map(tokenAddress => tokenAddress.toLowerCase()),
    );

    expect(output.stepOutputs.length).to.equal(7);

    // todo: `data` value changes when using actual ethereum deployed contract address
    expect(output.crossContractCalls).to.deep.equal([
      {
        to: WBTC.MCD_JOIN,
        data: '0x3b4da69f000000000000000000000000123d5ed9889ad2019e9ae967cddc4f36c052a3020000000000000000000000000000000000000000000000000000000005f21070',
      },
      {
        to: cdpManagerAddress,
        data: '0x45e6bdcd00000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000005f210700000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
      {
        to: cdpManagerAddress,
        data: '0xf9f30db6000000000000000000000000000000000000000000000000000000000000000500000000000000000000000012fdb15bc1b52edd68169af350e6ded8e55991340000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
      {
        to: MCD_VAT,
        data: '0xa3b22fc40000000000000000000000009759a6ac90977b93b58547b4a71c78317f391a28',
      },
      {
        to: DAI.MCD_JOIN,
        data: '0xef693bed00000000000000000000000012fdb15bc1b52edd68169af350e6ded8e55991340000000000000000000000000000000000000000000000000de0b6b3a7640000',
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
      name: 'Dai - Lock tokens',
      description: 'Locks collateral tokens on the token adapter contract',
      crossContractCalls: [
        // todo: `data` value changes after using actual deployed ethereum contracts
        {
          to: WBTC.MCD_JOIN,
          data: '0x3b4da69f000000000000000000000000123d5ed9889ad2019e9ae967cddc4f36c052a3020000000000000000000000000000000000000000000000000000000005f21070',
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

    expect(output.stepOutputs[2]).to.deep.equal({
      name: 'Dai - Add collateral into vault',
      description: 'Add the locked token into vault as collateral',
      crossContractCalls: [
        // todo: `data` value changes after using actual deployed ethereum contracts
        {
          to: cdpManagerAddress,
          data: '0x45e6bdcd00000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000005f210700000000000000000000000000000000000000000000000000de0b6b3a7640000',
        },
      ],
      outputERC20Amounts: [
        {
          approvedSpender: undefined,
          decimals: DAI.DECIMALS,
          expectedBalance: daiMintAmount,
          isBaseToken: false,
          minBalance: daiMintAmount,
          tokenAddress: DAI.ERC20,
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
      name: 'Dai - Move Dai to VAT for a user',
      description:
        'Move minted Dai tokens (technically owned by DAI adapter of MCD) to VAT for a user account',
      crossContractCalls: [
        // todo: `data` value changes after using actual deployed ethereum contracts
        {
          to: cdpManagerAddress,
          data: '0xf9f30db6000000000000000000000000000000000000000000000000000000000000000500000000000000000000000012fdb15bc1b52edd68169af350e6ded8e55991340000000000000000000000000000000000000000000000000de0b6b3a7640000',
        },
      ],
      outputERC20Amounts: [
        {
          approvedSpender: undefined,
          decimals: DAI.DECIMALS,
          expectedBalance: daiMintAmount,
          isBaseToken: false,
          minBalance: daiMintAmount,
          tokenAddress: DAI.ERC20,
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
      name: 'Dai - Allow the Dai adapter to move Dai',
      description: 'Allow the Dai adapter to move Dai from VAT to user address',
      crossContractCalls: [
        // todo: `data` value changes after using actual deployed ethereum contracts
        {
          to: MCD_VAT,
          data: '0xa3b22fc40000000000000000000000009759a6ac90977b93b58547b4a71c78317f391a28',
        },
      ],
      outputERC20Amounts: [
        {
          approvedSpender: undefined,
          decimals: DAI.DECIMALS,
          expectedBalance: daiMintAmount,
          isBaseToken: false,
          minBalance: daiMintAmount,
          tokenAddress: DAI.ERC20,
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

    expect(output.stepOutputs[5]).to.deep.equal({
      name: 'Dai - Exit to ERC20 DAI',
      description:
        'Exit the internal dai to the ERC-20 DAI after allowing the Dai adapter to move Dai from VAT to user address',
      crossContractCalls: [
        // todo: `data` value changes after using actual deployed ethereum contracts
        {
          to: DAI.MCD_JOIN,
          data: '0xef693bed00000000000000000000000012fdb15bc1b52edd68169af350e6ded8e55991340000000000000000000000000000000000000000000000000de0b6b3a7640000',
        },
      ],
      outputERC20Amounts: [
        {
          approvedSpender: undefined,
          decimals: DAI.DECIMALS,
          expectedBalance: daiMintAmount,
          isBaseToken: false,
          minBalance: daiMintAmount,
          tokenAddress: DAI.ERC20,
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

    expect(output.stepOutputs[6]).to.deep.equal({
      name: 'Shield (Default)',
      description: 'Shield ERC20s and NFTs into private RAILGUN balance.',
      crossContractCalls: [],
      outputERC20Amounts: [
        {
          approvedSpender: undefined,
          decimals: DAI.DECIMALS,
          expectedBalance: getShieldedAmountAfterFee(
            networkName,
            daiMintAmount,
          ),
          isBaseToken: false,
          minBalance: getShieldedAmountAfterFee(networkName, daiMintAmount),
          tokenAddress: DAI.ERC20,
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
          tokenAddress: DAI.ERC20,
          amount: getShieldFee(networkName, daiMintAmount),
          recipient: 'RAILGUN Shield Fee',
          decimals: DAI.DECIMALS,
        },
      ],
    });
  });
});
