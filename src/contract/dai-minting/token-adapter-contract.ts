import { abi } from '../../abi/abi';
import { Contract, Provider } from 'ethers';
import { TokenAdapter } from 'typechain';

export class CdpManagerContract {
  private readonly contract: TokenAdapter;

  constructor(contractAddress: string, provider?: Provider) {
    this.contract = new Contract(
      contractAddress,
      abi.daiMinting.tokenAdapter,
      provider,
    ) as unknown as TokenAdapter;
  }

  /**
   * Lock the specified amount into vault
   * @param vaultAddress urn
   * @param amount amount to lock
   * @returns transaction object
   */
  join(vaultAddress: string, amount: bigint) {
    return this.contract.join.populateTransaction(vaultAddress, amount);
  }

  /**
   * exit the internal DAI to the ERC-20 DAI
   * @param ownerAddress address to withdraw DAI to
   * @param amount amount to withdraw
   * @returns transaction object
   */
  exit(ownerAddress: string, amount: bigint) {
    return this.contract.exit.populateTransaction(ownerAddress, amount);
  }
}
