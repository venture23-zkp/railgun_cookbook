import {
  NetworkName,
} from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3DepositStep } from '../aave-deposit-step';
import { Aave } from '../../../api/aave';
import { AaveV3TokenData, StepInput } from '../../../models';
import { testConfig } from '../../../test/test-config.test';
import { MOCK_SHIELD_FEE_BASIS_POINTS } from '../../../test/mocks.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('aave-deposit-step', () => {
  const aavePoolAddress = Aave.getAaveInfoForNetwork(networkName).AavePoolV3;
  const ownableContractAddress = '0x76aec45D0A8e03CcB8ae594aA2D0D2f10E6d4a70'; // random address for test

  it('should deposit usdc amount', async () => {
    const usdcAmount = 10_000_000n; // 10 USDC

    const tokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount: usdcAmount,
      decimals: 6n,
      isBaseToken: false,
    };

    const step = new AaveV3DepositStep(
      tokenData,
      ownableContractAddress,
      aavePoolAddress,
    );

    const stepInput: StepInput = {
      networkName,
      erc20Amounts: [],
      nfts: [],
    };

    const output = await step.getValidStepOutput(stepInput);

    expect(output.name).to.equal('AAVEv3 Deposit');
    expect(output.description).to.equal('Deposits the specified ERC20 token to Aave V3 via AC');

    expect(output.outputERC20Amounts).to.deep.equal([]);
    expect(output.outputNFTs).to.deep.equal([]);

    expect(output.crossContractCalls).to.deep.equal([
      {
        data: '0x9e5d4c4900000000000000000000000087870bca3f3fd6335c3f4ce8392d69350b4fa4e2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000084617ba037000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000098968000000000000000000000000076aec45d0a8e03ccb8ae594aa2d0d2f10e6d4a70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        to: ownableContractAddress,
      },
    ]);

    expect(output.spentERC20Amounts).to.deep.equal([{
      amount: usdcAmount,
      decimals: 6n,
      recipient: ownableContractAddress,
      tokenAddress: testConfig.contractsEthereum.usdc,
    }])

  });
});
