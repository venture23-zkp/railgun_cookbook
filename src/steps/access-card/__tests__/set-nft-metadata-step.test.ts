import {
  NETWORK_CONFIG,
  NFTTokenType,
  NetworkName,
} from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AccessCardSetNFTMetadataStep } from '../set-nft-metadata';
import { AccessCardNFT } from '../../../api/access-card/access-card-nft';
import { StepInput } from '../../../models';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('update-access-card-nft-step', () => {
  const accessCardERC721Address =
    AccessCardNFT.getAddressesForNetwork(networkName).erc721;

  it('should update nft-metadata step', async () => {
    const encryptedNFTMetadata = '3a389f3e0b09395930291029495010';
    const nftTokenSubID = '0';
    const step = new AccessCardSetNFTMetadataStep(
      accessCardERC721Address,
      encryptedNFTMetadata,
      nftTokenSubID,
    );

    const stepInput: StepInput = {
      networkName,
      erc20Amounts: [],
      nfts: [
        {
          nftAddress: AccessCardNFT.getAddressesForNetwork(networkName).erc721,
          nftTokenType: NFTTokenType.ERC721,
          tokenSubID: nftTokenSubID,
          amount: 1n,
          recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
        },
      ],
    };

    const output = await step.getValidStepOutput(stepInput);

    // todo: the internal calldata will have different contract addresses for different networks
    expect(output.crossContractCalls).to.deep.equal([
      {
        data: '0x13c58d6800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000f3a389f3e0b093959302910294950100000000000000000000000000000000000',
        to: accessCardERC721Address,
      },
    ]);

    expect(output.outputNFTs).to.deep.equal([
      {
        amount: 1n,
        nftAddress: accessCardERC721Address,
        nftTokenType: NFTTokenType.ERC721,
        recipient: NETWORK_CONFIG[networkName].relayAdaptContract,
        tokenSubID: nftTokenSubID,
      },
    ]);

    expect(output.outputERC20Amounts.length).to.equal(0);
  });
});
