import { NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3RepayStep } from '../aave-repay-step';
import { Aave } from '../../../api/aave';
import { AaveV3TokenData, StepInput } from '../../../models';
import { testConfig } from '../../../test/test-config.test';
import { decodeCalldata } from '../../../utils/decoder';
import { ethers } from 'ethers';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('aave-repay-step', () => {
  const aavePoolAddress = Aave.getAaveInfoForNetwork(networkName).AavePoolV3;
  const ownableContractAddress = '0x76aec45D0A8e03CcB8ae594aA2D0D2f10E6d4a70'; // random address for test

  it('should repay usdc amount', async () => {
    const usdcAmount = 10_000_000n; // 10 USDC
    const interestRepayMode = 2;

    const tokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount: usdcAmount,
      decimals: 6n,
      isBaseToken: false,
    };

    const step = new AaveV3RepayStep(
      tokenData,
      ownableContractAddress,
      aavePoolAddress,
      interestRepayMode,
    );

    const stepInput: StepInput = {
      networkName,
      erc20Amounts: [
        {
          expectedBalance: usdcAmount,
          minBalance: usdcAmount,
          tokenAddress: tokenData.tokenAddress,
          decimals: tokenData.decimals,
          approvedSpender: undefined,
        },
      ],
      nfts: [],
    };

    const output = await step.getValidStepOutput(stepInput);

    const decodedExecuteCalldata = decodeCalldata(
      ['address', 'uint256', 'bytes'],
      output.crossContractCalls[0].data,
    );

    const decodedRepayCalldata = decodeCalldata(
      ['address', 'uint256', 'uint256', 'address'],
      decodedExecuteCalldata[2],
    );

    expect(output.name).to.equal('AAVEv3 Repay');
    expect(output.description).to.equal(
      'Repays the specified ERC20 token from Account Contract(AC) to Aave V3',
    );

    expect(decodedExecuteCalldata[0]).to.equal(
      ethers.getAddress(Aave.getAaveInfoForNetwork(networkName).AavePoolV3),
    );
    expect(decodedRepayCalldata).to.deep.equal([
      ethers.getAddress(testConfig.contractsEthereum.usdc),
      usdcAmount,
      BigInt(interestRepayMode),
      ownableContractAddress,
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
