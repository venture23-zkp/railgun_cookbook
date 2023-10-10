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
}
