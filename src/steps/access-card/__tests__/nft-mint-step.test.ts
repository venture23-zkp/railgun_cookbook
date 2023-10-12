import { NFTTokenType, NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AccessCardNFTMintStep } from '../nft-mint-step';
import { AccessCardNFT } from '../../../api/access-card/access-card-nft';
import { StepInput } from '../../../models';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('mint-access-card-nft-step', () => {
  const accessCardERC721Address =
    AccessCardNFT.getAddressesForNetwork(networkName).erc721;

  it('should create mint-nft step', async () => {
    const encryptedNFTMetadata =
      '4d594d3e82f43d8e97bb70cb9c6d4a3e2f57a1f43966a4017fdbeae708';
    const step = new AccessCardNFTMintStep(
      accessCardERC721Address,
      encryptedNFTMetadata,
    );

    const stepInput: StepInput = {
      networkName,
      erc20Amounts: [],
      nfts: [],
    };

    const output = await step.getValidStepOutput(stepInput);

    // todo: the internal calldata will have different contract addresses for different networks
    expect(output.crossContractCalls).to.deep.equal([
      {
        data: '0x7ba0e2e70000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001d4d594d3e82f43d8e97bb70cb9c6d4a3e2f57a1f43966a4017fdbeae708000000',
        to: accessCardERC721Address,
      },
    ]);

    expect(output.outputERC20Amounts.length).to.equal(0);
    expect(output.outputNFTs).to.deep.equal([
      {
        amount: 0n,
        nftAddress: accessCardERC721Address,
        nftTokenType: NFTTokenType.ERC721,
        tokenSubID: '0',
        owns: undefined,
      },
    ]);
  });
});
