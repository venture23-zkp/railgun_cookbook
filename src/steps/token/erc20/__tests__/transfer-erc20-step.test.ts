import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { TransferERC20Step } from '../transfer-erc20-step';
import { BigNumber } from 'ethers';
import { RecipeERC20Info, StepInput } from '../../../../models/export-models';
import { NetworkName } from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.Ethereum;
const toAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
const erc20Info: RecipeERC20Info = {
  tokenAddress: '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D',
  decimals: 18,
};
const amount = BigNumber.from('10000');

describe('transfer-erc20-step', () => {
  it('Should create transfer-erc20 step with amount', async () => {
    const step = new TransferERC20Step(toAddress, erc20Info, amount);

    const stepInput: StepInput = {
      networkName,
      erc20Amounts: [
        {
          tokenAddress: erc20Info.tokenAddress,
          decimals: erc20Info.decimals,
          expectedBalance: BigNumber.from('12000'),
          minBalance: BigNumber.from('12000'),
          approvedSpender: undefined,
        },
      ],
      nfts: [],
    };
    const output = await step.getValidStepOutput(stepInput);

    expect(output.name).to.equal('Transfer ERC20');
    expect(output.description).to.equal(
      'Transfers ERC20 token to an external public address.',
    );

    // Transferred
    expect(output.spentERC20Amounts).to.deep.equal([
      {
        amount,
        recipient: toAddress,
        tokenAddress: erc20Info.tokenAddress,
        decimals: 18,
      },
    ]);

    // Change
    expect(output.outputERC20Amounts).to.deep.equal([
      {
        approvedSpender: undefined,
        expectedBalance: BigNumber.from('2000'),
        minBalance: BigNumber.from('2000'),
        tokenAddress: erc20Info.tokenAddress,
        decimals: 18,
      },
    ]);

    expect(output.spentNFTs).to.deep.equal([]);
    expect(output.outputNFTs).to.deep.equal([]);

    expect(output.feeERC20AmountRecipients).to.deep.equal([]);

    expect(output.populatedTransactions).to.deep.equal([
      {
        data: '0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000002710',
        to: '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D',
      },
    ]);
    expect(output.populatedTransactions[0].to).to.equal(erc20Info.tokenAddress);
  });

  it('Should create transfer-erc20 step without amount', async () => {
    const step = new TransferERC20Step(toAddress, erc20Info);

    const stepInput: StepInput = {
      networkName,
      erc20Amounts: [
        {
          tokenAddress: erc20Info.tokenAddress,
          decimals: erc20Info.decimals,
          expectedBalance: BigNumber.from('12000'),
          minBalance: BigNumber.from('12000'),
          approvedSpender: undefined,
        },
      ],
      nfts: [],
    };
    const output = await step.getValidStepOutput(stepInput);

    // Transferred
    expect(output.spentERC20Amounts).to.deep.equal([
      {
        amount: BigNumber.from('12000'),
        recipient: toAddress,
        tokenAddress: erc20Info.tokenAddress,
        decimals: 18,
      },
    ]);

    // Change
    expect(output.outputERC20Amounts).to.deep.equal([]);

    expect(output.spentNFTs).to.deep.equal([]);
    expect(output.outputNFTs).to.deep.equal([]);

    expect(output.feeERC20AmountRecipients).to.deep.equal([]);

    expect(output.populatedTransactions).to.deep.equal([
      {
        data: '0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000002ee0',
        to: '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D',
      },
    ]);
  });

  it('Should test transfer-erc20 step error cases', async () => {
    const step = new TransferERC20Step(toAddress, erc20Info, amount);

    // No matching erc20 inputs
    const stepInputNoERC20s: StepInput = {
      networkName,
      erc20Amounts: [],
      nfts: [],
    };
    await expect(step.getValidStepOutput(stepInputNoERC20s)).to.be.rejectedWith(
      'Transfer ERC20 step failed. No step inputs match filter.',
    );

    // Too low balance for erc20 input
    const stepInputLowBalance: StepInput = {
      networkName,
      erc20Amounts: [
        {
          tokenAddress: erc20Info.tokenAddress,
          decimals: erc20Info.decimals,
          expectedBalance: BigNumber.from('2000'),
          minBalance: BigNumber.from('2000'),
          approvedSpender: undefined,
        },
      ],
      nfts: [],
    };
    await expect(
      step.getValidStepOutput(stepInputLowBalance),
    ).to.be.rejectedWith(
      'Transfer ERC20 step failed. Specified amount 10000 exceeds balance 2000.',
    );
  });
});
