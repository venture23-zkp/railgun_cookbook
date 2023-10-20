import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3TransferToRelayStep } from '../aave-relay-transfer-step';
import { AaveV3TokenData, StepInput } from '../../../models';
import { testConfig } from '../../../test/test-config.test';
import { decodeCalldata } from '../../../utils/decoder';
import { ethers } from 'ethers';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('aave-relay-transfer-step', () => {
  it('should create aave-relay-transfer-step', async () => {
    const amount = 10_000n;

    const aaveTokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount,
      decimals: 6n,
    };

    const ownableAccountContractAddress =
      '0x4b43618d599daa14d1573c39dae0a4e094cc64e5'; // random address

    const step = new AaveV3TransferToRelayStep(
      aaveTokenData,
      ownableAccountContractAddress,
    );

    const stepInput: StepInput = {
      networkName,
      erc20Amounts: [],
      nfts: [],
    };

    const output = await step.getValidStepOutput(stepInput);

    const decodedExecuteCalldata = decodeCalldata(
      ['address', 'uint256', 'bytes'],
      output.crossContractCalls[0].data,
    );

    const decodedTransferCalldata = decodeCalldata(
      ['address', 'uint256'],
      decodedExecuteCalldata[2],
    );

    expect(decodedExecuteCalldata[0]).to.equal(
      ethers.getAddress(aaveTokenData.tokenAddress),
    );
    expect(decodedTransferCalldata).to.deep.equal([
      ethers.getAddress(NETWORK_CONFIG[networkName].relayAdaptContract),
      amount,
    ]);

    expect(output.outputERC20Amounts.length).to.equal(0);
    expect(output.outputNFTs.length).to.equal(0);
  });
});
