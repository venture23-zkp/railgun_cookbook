import { BigNumber } from '@ethersproject/bignumber';
import {
  RecipeERC20AmountRecipient,
  RecipeERC20Info,
  StepInput,
  StepOutputERC20Amount,
  UnvalidatedStepOutput,
} from '../../../models/export-models';
import { compareERC20Info, isApprovedForSpender } from '../../../utils/token';
import { Step } from '../../step';
import { BeefyVaultData } from '../../../api/beefy';
import { BeefyVaultContract } from '../../../contract/vault/beefy-vault-contract';

export class BeefyDepositStep extends Step {
  readonly config = {
    name: 'Beefy Vault Deposit',
    description: 'Deposits into a yield-bearing Beefy Vault.',
  };

  private readonly vault: BeefyVaultData;

  constructor(vault: BeefyVaultData) {
    super();
    this.vault = vault;
  }

  protected async getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput> {
    const {
      vaultID,
      vaultName,
      depositERC20Address,
      depositERC20Decimals,
      vaultContractAddress,
      vaultTokenAddress,
      vaultRate,
      depositFee,
    } = this.vault;
    const { erc20Amounts } = input;

    const depositERC20Info: RecipeERC20Info = {
      tokenAddress: depositERC20Address,
    };
    const { erc20AmountForStep, unusedERC20Amounts } =
      this.getValidInputERC20Amount(
        erc20Amounts,
        erc20Amount =>
          compareERC20Info(erc20Amount, depositERC20Info) &&
          isApprovedForSpender(erc20Amount, vaultContractAddress),
        undefined, // amount
      );

    const contract = new BeefyVaultContract(vaultContractAddress);
    const populatedTransaction = await contract.createDepositAll();

    const depositFeeBasisPoints = BigNumber.from(depositFee * 10000);
    const depositAmount = erc20AmountForStep.expectedBalance;
    const depositFeeAmount = BigNumber.from(depositAmount)
      .mul(depositFeeBasisPoints)
      .div(10000);
    const depositAmountAfterFee = depositAmount.sub(depositFeeAmount);

    const decimalsAdjustment = BigNumber.from(10).pow(depositERC20Decimals);
    const expectedBalance = BigNumber.from(depositAmountAfterFee)
      .mul(decimalsAdjustment)
      .div(vaultRate);

    const spentERC20AmountRecipient: RecipeERC20AmountRecipient = {
      ...depositERC20Info,
      amount: depositAmountAfterFee,
      recipient: `${vaultName} (${vaultID})`,
    };
    const outputERC20Amount: StepOutputERC20Amount = {
      tokenAddress: vaultTokenAddress,
      expectedBalance,
      minBalance: expectedBalance,
      approvedSpender: undefined,
    };
    const feeERC20Amount: RecipeERC20AmountRecipient = {
      ...depositERC20Info,
      amount: depositFeeAmount,
      recipient: `${vaultName} Fee`,
    };

    return {
      populatedTransactions: [populatedTransaction],
      spentERC20Amounts: [spentERC20AmountRecipient],
      outputERC20Amounts: [outputERC20Amount, ...unusedERC20Amounts],
      spentNFTs: [],
      outputNFTs: input.nfts,
      feeERC20AmountRecipients: [feeERC20Amount],
    };
  }
}
