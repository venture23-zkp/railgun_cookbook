import { abi } from '../../abi/abi';
import { Contract, ContractTransaction, Provider } from 'ethers';
import { AavePool } from 'typechain';

export class AaveV3PoolContract {
  private readonly contract: AavePool;

  constructor(contractAddress: string, provider?: Provider) {
    this.contract = new Contract(
      contractAddress,
      abi.aave.aavePool,
      provider,
    ) as unknown as AavePool;
  }

  async deposit(
    tokenAddress: string,
    amount: bigint,
    onBehalfOf: string,
    referralCode: bigint,
  ): Promise<ContractTransaction> {
    return this.contract.supply.populateTransaction(
      tokenAddress,
      amount,
      onBehalfOf,
      referralCode,
    );
  }

  async withdraw(
    tokenAddress: string,
    amount: bigint,
    withdrawalAddress: string,
  ): Promise<ContractTransaction> {
    return this.contract.withdraw.populateTransaction(
      tokenAddress,
      amount,
      withdrawalAddress,
    );
  }

  async borrow(
    tokenAddress: string,
    amount: bigint,
    onBehalfOf: string,
    interestRateMode: number, // 1 or 2 
    referralCode: number,
  ): Promise<ContractTransaction> {
    return this.contract.borrow.populateTransaction(
      tokenAddress,
      amount,
      BigInt(interestRateMode),
      BigInt(referralCode),
      onBehalfOf,
    );
  }

  async repay(
    tokenAddress: string,
    amount: bigint,
    onBehalfOf: string,
    interestRateMode: number,
  ) {
    return this.contract.repay.populateTransaction(
      tokenAddress,
      amount,
      BigInt(interestRateMode),
      onBehalfOf,
    );
  }
}
