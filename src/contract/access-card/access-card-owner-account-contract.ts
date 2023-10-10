import { abi } from '../../abi/abi';
import { validateContractAddress } from '../../utils/address';
import { AccessCardOwnerAccount } from '../../typechain';
import { Contract, ContractTransaction } from 'ethers';

export class AccessCardOwnerAccountContract {
  private readonly contract: AccessCardOwnerAccount;

  constructor(address: string) {
    if (!validateContractAddress(address)) {
      throw new Error(
        'Invalid factory address for Access Card Account Owner contract',
      );
    }
    this.contract = new Contract(
      address,
      abi.accessCard.ownerAccount,
    ) as unknown as AccessCardOwnerAccount;
  }

  executeCall(
    to: string,
    data: string,
    value: bigint,
  ): Promise<ContractTransaction> {
    return this.contract.executeCall.populateTransaction(to, value, data);
  }
}
