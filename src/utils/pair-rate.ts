import { BigNumber } from '@ethersproject/bignumber';

export const calculatePairRateWith18Decimals = (
  reserveA: BigNumber,
  tokenDecimalsA: number,
  reserveB: BigNumber,
  tokenDecimalsB: number,
) => {
  const decimals18 = BigNumber.from(10).pow(18);
  const decimalsA = BigNumber.from(10).pow(tokenDecimalsA);
  const decimalsB = BigNumber.from(10).pow(tokenDecimalsB);

  const rateWith18Decimals = reserveA
    .mul(decimals18)
    .mul(decimalsB)
    .div(reserveB)
    .div(decimalsA);
  return rateWith18Decimals;
};

export const calculateAmountBFromPairRate = (
  amountA: BigNumber,
  decimalsA: number,
  decimalsB: number,
  rateWith18Decimals: BigNumber,
) => {
  const decimals18 = BigNumber.from(10).pow(18);

  const amountB = amountA
    .mul(decimals18)
    .mul(decimalsB)
    .div(rateWith18Decimals)
    .div(decimalsA);
  return amountB;
};
