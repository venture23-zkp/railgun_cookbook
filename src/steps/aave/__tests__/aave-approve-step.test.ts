import { NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3ApproveStep } from '../aave-approve-step';
import { AaveV3TokenData, StepInput } from '../../../models';
import { testConfig } from '../../../test/test-config.test';
import { Aave } from '../../../api';
import { decodeCalldata } from '../../../utils/decoder';
import { ethers } from 'ethers';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('aave-approve-step', () => {
  const ownableContractAddress = '0x76aec45D0A8e03CcB8ae594aA2D0D2f10E6d4a70'; // random address for test

  it('should approve usdc amount', async () => {
    const usdcAmount = 10_000_000n; // 10 USDC

    const tokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount: usdcAmount,
      decimals: 6n,
      isBaseToken: false,
    };

    const step = new AaveV3ApproveStep(
      tokenData,
      ownableContractAddress,
      Aave.getAaveInfoForNetwork(networkName).AavePoolV3,
      usdcAmount,
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

    const decodedApprovalCalldata = decodeCalldata(
      ['address', 'uint256'],
      decodedExecuteCalldata[2],
    );

    expect(output.name).to.equal('AAVEv3 Approval');
    expect(output.description).to.equal(
      'Approves the specified ERC20 token to Aave V3 via AC',
    );

    expect(output.outputERC20Amounts).to.deep.equal([
      {
        approvedSpender: Aave.getAaveInfoForNetwork(networkName).AavePoolV3,
        decimals: tokenData.decimals,
        expectedBalance: usdcAmount,
        isBaseToken: tokenData.isBaseToken,
        minBalance: usdcAmount,
        tokenAddress: tokenData.tokenAddress,
      },
    ]);
    expect(output.outputNFTs).to.deep.equal([]);

    expect(ethers.getAddress(decodedExecuteCalldata[0])).to.equal(
      ethers.getAddress(testConfig.contractsEthereum.usdc),
    );
    expect(ethers.getAddress(decodedApprovalCalldata[0])).to.equal(
      ethers.getAddress(Aave.getAaveInfoForNetwork(networkName).AavePoolV3),
    );
    expect(decodedApprovalCalldata[1]).to.equal(usdcAmount);
  });
});
