import { NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3DepositStep } from '../aave-deposit-step';
import { Aave } from '../../../api/aave';
import { AaveV3TokenData, StepInput } from '../../../models';
import { testConfig } from '../../../test/test-config.test';
import { decodeCalldata } from '../../../utils/decoder';
import { ethers } from 'ethers';

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

    const decodedExecuteCalldata = decodeCalldata(
      ['address', 'uint256', 'bytes'],
      output.crossContractCalls[0].data,
    );

    const decodedDepositCalldata = decodeCalldata(
      ['address', 'uint256', 'address', 'uint16'],
      decodedExecuteCalldata[2],
    );

    expect(output.name).to.equal('AAVEv3 Deposit');
    expect(output.description).to.equal(
      'Deposits the specified ERC20 token to Aave V3 via AC',
    );

    expect(decodedExecuteCalldata[0]).to.equal(
      ethers.getAddress(Aave.getAaveInfoForNetwork(networkName).AavePoolV3),
    );
    expect(decodedDepositCalldata).to.deep.equal([
      ethers.getAddress(testConfig.contractsEthereum.usdc),
      usdcAmount,
      ethers.getAddress(ownableContractAddress),
      0n,
    ]);

    expect(output.outputERC20Amounts).to.deep.equal([]);
    expect(output.outputNFTs).to.deep.equal([]);

    expect(output.spentERC20Amounts).to.deep.equal([
      {
        amount: usdcAmount,
        decimals: 6n,
        recipient: ownableContractAddress,
        tokenAddress: testConfig.contractsEthereum.usdc,
      },
    ]);
  });
});
