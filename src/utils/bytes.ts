import { fromUTF8String, hexlify } from "@railgun-community/wallet";

// utility function for dai-minting
export function convertToIlk(input: string) {
  return hexlify(fromUTF8String(input), true).padEnd(66, '0');
}