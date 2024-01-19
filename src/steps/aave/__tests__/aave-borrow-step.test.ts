import { NetworkName } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AaveV3BorrowStep } from '../aave-borrow-step';
import { Aave } from '../../../api';
import { AaveV3TokenData, StepInput } from '../../../models';
import { testConfig } from '../../../test/test-config.test';
import { decodeCalldata } from '../../../utils/decoder';
import { ethers } from 'ethers';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;

describe('aave-borrow-step', () => {
  it('should create aave-borrow-step', async () => {
    const { AavePoolV3: aaveV3PoolAddress } =
      Aave.getAaveInfoForNetwork(networkName);

    const amount = 10_000n;
    const interestRateMode = 2;

    const aaveTokenData: AaveV3TokenData = {
      tokenAddress: testConfig.contractsEthereum.usdc,
      amount,
      decimals: 6n,
    };

    const ownableAccountContractAddress =
      '0x4b43618d599daa14d1573c39dae0a4e094cc64e5'; // random address

    const step = new AaveV3BorrowStep(
      aaveTokenData,
      ownableAccountContractAddress,
      aaveV3PoolAddress,
      amount,
      interestRateMode,
      0,
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

    const decodedBorrowCalldata = decodeCalldata(
      ['address', 'uint256', 'uint256', 'uint16', 'address'],
      decodedExecuteCalldata[2],
    );

    expect(output.name).to.equal('AAVEv3 Borrow');
    expect(output.description).to.equal(
      'Borrows the specified ERC20 token from Aave V3 via AC',
    );

    expect(ethers.getAddress(decodedExecuteCalldata[0])).to.equal(
      ethers.getAddress(Aave.getAaveInfoForNetwork(networkName).AavePoolV3),
    );
    expect(decodedBorrowCalldata).to.deep.equal([
      ethers.getAddress(testConfig.contractsEthereum.usdc),
      amount,
      BigInt(interestRateMode),
      BigInt(0),
      ethers.getAddress(ownableAccountContractAddress),
    ]);

    expect(output.outputERC20Amounts).to.deep.equal([
      {
        approvedSpender: undefined,
        decimals: aaveTokenData.decimals,
        expectedBalance: aaveTokenData.amount,
        minBalance: aaveTokenData.amount,
        tokenAddress: testConfig.contractsEthereum.usdc,
      },
    ]);

    expect(output.outputNFTs.length).to.equal(0);
  });
});
