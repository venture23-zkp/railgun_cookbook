import { abi } from '../../abi/abi';
import { Contract, Provider } from 'ethers';
import { CdpManager } from '../../typechain';

export class CdpManagerContract {
  private readonly contract: CdpManager;

  constructor(contractAddress: string, provider?: Provider) {
    this.contract = new Contract(
      contractAddress,
      abi.daiMinting.cdpManager,
      provider,
    ) as unknown as CdpManager;
  }

  /**
   *
   * @param ilk 32 bytes vault type
   * @param openingAddress Vault opener's wallet address
   * @returns transaction object
   */
  openVault(ilk: string, openingAddress: string) {
    return this.contract.open.populateTransaction(ilk, openingAddress);
  }

  /**
   *
   * @param cdpId cdpId to add collateral into
   * @param dink amount to deposit as collateral
   * @param dart amount to withdraw in DAI
   * @returns transaction object
   */
  addCollateral(cdpId: bigint, dink: bigint, dart: bigint) {
    return this.contract.frob.populateTransaction(cdpId, dink, dart);
  }

  /**
   * 
   * @param cdpId vault ID to withdraw from 
   * @param address address to withdraw the DAI to
   * @param amount amount to withdraw
   * @returns transaction object
   */
  moveDaiToVatForAddress(cdpId: bigint, address: string, amount: bigint) {
    return this.contract.move.populateTransaction(cdpId, address, amount)
  }

  /**
   *
   * @param address wallet address to query for
   * @returns last Cdp id of given address
   */
  getLastCdpId(address: string) {
    return this.contract.last.staticCallResult(address);
  }

  /**
   *
   * @param cdpId cdpId to query
   * @returns Vault address (urn) associated with the given CDP id
   */
  getVaultAddressByCdpId(cdpId: bigint) {
    return this.contract.urns.staticCallResult(cdpId);
  }
}
