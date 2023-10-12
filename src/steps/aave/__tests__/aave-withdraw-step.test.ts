import { NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3WithdrawStep } from '../aave-withdraw-step';
import { Aave } from '../../../api';
import { AaveV3TokenData, StepInput } from '../../../models';
import { testConfig } from '../../../test/test-config.test';
import { MOCK_RAILGUN_WALLET_ADDRESS } from '../../../test/mocks.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('aave-withdraw-step', () => {
  it('should create aave-withdraw-step', async () => {
    const { AavePoolV3: aaveV3PoolAddress } =
      Aave.getAaveInfoForNetwork(networkName);

    const amount = 10_000n;

    const aaveTokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount,
      decimals: 6n,
    };

    const ownableAccountContractAddress =
      '0x4b43618d599daa14d1573c39dae0a4e094cc64e5'; // random address

    const step = new AaveV3WithdrawStep(
      aaveTokenData,
      ownableAccountContractAddress,
      aaveV3PoolAddress,
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
        data: '0x9e5d4c4900000000000000000000000087870bca3f3fd6335c3f4ce8392d69350b4fa4e200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000006469328dec000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000027100000000000000000000000004b43618d599daa14d1573c39dae0a4e094cc64e500000000000000000000000000000000000000000000000000000000',
        to: ownableAccountContractAddress,
      },
    ]);

    expect(output.outputERC20Amounts).to.deep.equal([{
      approvedSpender: undefined,
      decimals: aaveTokenData.decimals,
      expectedBalance: aaveTokenData.amount,
      minBalance: aaveTokenData.amount,
      recipient: MOCK_RAILGUN_WALLET_ADDRESS,
      tokenAddress: testConfig.contractsEthereum.usdc,
    }]);

    expect(output.outputNFTs.length).to.equal(0);
  });
});
