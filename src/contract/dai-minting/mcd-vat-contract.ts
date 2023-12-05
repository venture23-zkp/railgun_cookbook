import { abi } from '../../abi/abi';
import { Contract, Provider } from 'ethers';
import { McdVat } from '../../typechain';

export class McdVatContract {
  private readonly contract: McdVat;

  constructor(contractAddress: string, provider?: Provider) {
    this.contract = new Contract(
      contractAddress,
      abi.daiMinting.mcdVat,
      provider,
    ) as unknown as McdVat;
  }

  /**
   * allow the Dai adapter to move Dai from VAT to user address
   * @param daiAdapterAddress
   * @returns transaction object
   */
  allowDaiWithdrawal(daiAdapterAddress: string) {
    return this.contract.hope.populateTransaction(daiAdapterAddress);
  }

  /**
   * Get the amount of tokens locked in the given vault type and vault address
   * @param ilk 32 bytes vault type
   * @param vaultAddress urn
   * @returns Amount of tokens locked
   */
  getLockedAmount(ilk: string, vaultAddress: string) {
    return this.contract.gem.staticCallResult(ilk, vaultAddress);
  }

  /**
   * Get the DAI balance held by MCD DAI adapter for the given urn
   * @param vaultAddress urn
   * @returns DAI balance held by MCD_DAI adapter
   */
  getInternalDaiBalance(vaultAddress: string) {
    return this.contract.dai.staticCallResult(vaultAddress);
  }

  /**
   * Returns ilk info (Art, rate, spot, line, dust)
   * @param tokenIlk 32 bytes vault type
   * @returns
   */
  getIlkInfo(tokenIlk: string) {
    return this.contract.ilks.staticCallResult(tokenIlk) as unknown as bigint[];
  }
}
