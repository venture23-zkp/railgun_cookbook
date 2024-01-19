import { Contract, Provider } from 'ethers';
import { abi } from '../../abi/abi';
import { ERC6551Registry } from '../../typechain';

export class ERC6551RegistryContract {
  private readonly contract: ERC6551Registry;

  constructor(address: string, provider: Provider) {
    this.contract = new Contract(
      address,
      abi.registry.erc6551Registry,
      provider,
    ) as unknown as ERC6551Registry;
  }

  getAccountContract(
    defaultAccountAddress: string,
    accessCardContractAddress: string,
    tokenSubId: string,
    chainId: number,
    salt: number = 0,
  ) {
    return this.contract.account.staticCall(
      defaultAccountAddress,
      chainId,
      accessCardContractAddress,
      tokenSubId,
      salt,
    );
  }
}
