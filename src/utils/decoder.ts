import { ethers } from "ethers";
import { DataHexString } from "ethers/lib.commonjs/utils/data";

export function decodeCalldata(paramTypes: string[], calldata: DataHexString) {
  return ethers.AbiCoder.defaultAbiCoder().decode(
    paramTypes,
    ethers.dataSlice(calldata, 4),
    true
  );
}