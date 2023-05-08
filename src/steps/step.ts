import { BigNumber } from '@ethersproject/bignumber';
import {
  StepInput,
  StepOutput,
  StepConfig,
  UnvalidatedStepOutput,
  StepOutputERC20Amount,
} from '../models/export-models';
import { ERC20AmountFilter, filterERC20AmountInputs } from '../utils/filters';
import { validateStepOutput } from '../validators/step-validator';

export abstract class Step {
  abstract readonly config: StepConfig;

  readonly canAddStep: boolean = true;

  protected abstract getStepOutput(
    input: StepInput,
  ): Promise<UnvalidatedStepOutput>;

  async getValidStepOutput(input: StepInput): Promise<StepOutput> {
    try {
      const output: UnvalidatedStepOutput = await this.getStepOutput(input);
      validateStepOutput(input, output);

      return {
        ...output,
        name: this.config.name,
        description: this.config.description,
      };
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }
      throw new Error(`${this.config.name} step failed. ${err.message}`);
    }
  }

  protected getValidInputERC20Amount(
    inputERC20Amounts: StepOutputERC20Amount[],
    filter: ERC20AmountFilter,
    amount: Optional<BigNumber>,
  ): {
    erc20AmountForStep: StepOutputERC20Amount;
    unusedERC20Amounts: StepOutputERC20Amount[];
  } {
    const { erc20AmountsForStep, unusedERC20Amounts } = filterERC20AmountInputs(
      inputERC20Amounts,
      filter,
    );

    const numFiltered = erc20AmountsForStep.length;
    if (numFiltered === 0) {
      throw new Error(`No step inputs match filter.`);
    }
    if (numFiltered > 1) {
      throw new Error(
        `Expected one erc20 amount for step input - received ${numFiltered}.`,
      );
    }

    // Copy values to new object.
    const erc20AmountForStep = { ...erc20AmountsForStep[0] };

    const hasNonDeterministicInput = !erc20AmountForStep.expectedBalance.eq(
      erc20AmountForStep.minBalance,
    );

    // If this step has a non-deterministic output, we must provide deterministic inputs.
    // Otherwise, the expected balances become too complicated and variable.
    if (this.config.hasNonDeterministicOutput && hasNonDeterministicInput) {
      throw new Error(
        `Non-deterministic step must have deterministic inputs - you may not stack non-deterministic steps in a single recipe.`,
      );
    }

    if (amount) {
      // If we have a specified amount, we must have a deterministic input in order to generate the change outputs.
      if (hasNonDeterministicInput) {
        throw new Error(
          'Cannot specify amount for step if it has non-deterministic inputs.',
        );
      }
      // Note: minBalance === expectedBalance
      if (amount.gt(erc20AmountForStep.expectedBalance)) {
        throw new Error(
          `Specified amount ${amount.toString()} exceeds balance ${erc20AmountForStep.expectedBalance.toString()}.`,
        );
      }
    }

    // Add change output.
    const changeOutputs = this.getChangeOutputs(erc20AmountForStep, amount);
    if (changeOutputs) {
      unusedERC20Amounts.push(changeOutputs.changeOutput);
      erc20AmountForStep.expectedBalance = changeOutputs.expectedBalance;
      erc20AmountForStep.minBalance = changeOutputs.minBalance;
    }

    return { erc20AmountForStep, unusedERC20Amounts };
  }

  private getChangeOutputs(
    erc20AmountForStep: StepOutputERC20Amount,
    amountUsed: Optional<BigNumber>,
  ) {
    if (!amountUsed || amountUsed.gte(erc20AmountForStep.expectedBalance)) {
      return undefined;
    }

    const changeBalance = erc20AmountForStep.expectedBalance.sub(amountUsed);
    const changeOutput: StepOutputERC20Amount = {
      ...erc20AmountForStep,
      expectedBalance: changeBalance,
      minBalance: changeBalance,
    };
    return {
      expectedBalance: amountUsed,
      minBalance: amountUsed,
      changeOutput,
    };
  }

  protected getValidInputERC20Amounts(
    inputERC20Amounts: StepOutputERC20Amount[],
    filters: ERC20AmountFilter[],
    amounts: Optional<BigNumber>[],
  ): {
    erc20AmountsForStep: StepOutputERC20Amount[];
    unusedERC20Amounts: StepOutputERC20Amount[];
  } {
    if (amounts.length !== filters.length) {
      throw new Error(
        'getValidInputERC20Amounts requires one amount for each filter (can be array of undefineds).',
      );
    }

    const anyFilterPasses = (erc20Amount: StepOutputERC20Amount) => {
      return (
        filters.find(filter => {
          return filter(erc20Amount);
        }) != null
      );
    };

    const { erc20AmountsForStep, unusedERC20Amounts } = filterERC20AmountInputs(
      inputERC20Amounts,
      anyFilterPasses,
    );

    const numFiltered = erc20AmountsForStep.length;
    if (numFiltered !== filters.length) {
      throw new Error(
        `Step input does not include a balance for each filtered token.`,
      );
    }

    // Add change outputs.
    erc20AmountsForStep.forEach((erc20AmountForStep, index) => {
      const amount = amounts[index];
      const changeOutputs = this.getChangeOutputs(erc20AmountForStep, amount);
      if (changeOutputs) {
        unusedERC20Amounts.push(changeOutputs.changeOutput);
        erc20AmountForStep.expectedBalance = changeOutputs.expectedBalance;
        erc20AmountForStep.minBalance = changeOutputs.minBalance;
      }
    });

    return { erc20AmountsForStep, unusedERC20Amounts };
  }
}
