import { NETWORK_CONFIG, NFTTokenType, NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3TransferStep } from '../aave-transfer-step';
import { AaveV3TokenData, StepInput } from '../../../models';
import { testConfig } from '../../../test/test-config.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('aave-transfer-step', () => {
  it('should create aave-transfer-step', async () => {

    const amount = 10_000n;
    
    const aaveTokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount,
      decimals: 6n,
    }

    const ownableAccountContractAddress = '0x4b43618d599daa14d1573c39dae0a4e094cc64e5'; // random address

    const step = new AaveV3TransferStep(
      aaveTokenData,
      ownableAccountContractAddress,
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
        data: '0x9e5d4c49000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000003ab4da0f8fa0e0bb3db60cee269c90ea296b9a5b000000000000000000000000000000000000000000000000000000000000271000000000000000000000000000000000000000000000000000000000',
        to: ownableAccountContractAddress,
      },
    ]);

    expect(output.outputERC20Amounts.length).to.equal(0);
    expect(output.outputNFTs.length).to.equal(0);
  });
});
