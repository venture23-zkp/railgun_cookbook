import {
  gasEstimateForUnprovenCrossContractCalls,
  generateCrossContractCallsProof,
  mnemonicToPKey,
  populateProvedCrossContractCalls,
} from '@railgun-community/wallet';
import {
  EVMGasType,
  NetworkName,
  RailgunERC20AmountRecipient,
  RailgunERC20Recipient,
  RailgunNFTAmountRecipient,
  TransactionGasDetails,
  isDefined,
} from '@railgun-community/shared-models';
import { ContractTransaction, JsonRpcProvider, Wallet } from 'ethers';
import { testConfig } from './test-config.test';
import { RecipeInput, RecipeOutput } from '../models';
import { AbstractWallet } from '@railgun-community/engine';

export let testRPCProvider: Optional<JsonRpcProvider>;
export let testRailgunWallet: AbstractWallet;
export let testRailgunWallet2: AbstractWallet;

export const setSharedTestRPCProvider = (provider: JsonRpcProvider) => {
  testRPCProvider = provider;
};

export const setSharedTestRailgunWallet = (wallet: AbstractWallet) => {
  testRailgunWallet = wallet;
};

export const setSharedTestRailgunWallet2 = (wallet: AbstractWallet) => {
  testRailgunWallet2 = wallet;
};

export const getTestProvider = (): JsonRpcProvider => {
  const provider = testRPCProvider;
  if (!provider) {
    throw new Error('No test ethers provider');
  }
  return provider;
};

export const getTestEthersWallet = (): Wallet => {
  const provider = getTestProvider();
  const pkey = mnemonicToPKey(testConfig.signerMnemonic);
  return new Wallet(pkey).connect(provider);
};

export const getTestRailgunWallet = () => {
  const wallet = testRailgunWallet;
  if (!isDefined(wallet)) {
    throw new Error('No test railgun wallet created');
  }
  return wallet;
};

export const getTestRailgunWallet2 = () => {
  const wallet = testRailgunWallet2;
  if (!isDefined(wallet)) {
    throw new Error('No test railgun wallet 2 created');
  }
  return wallet;
};

export const takeGanacheSnapshot = async (): Promise<number> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return (await getTestProvider().send('evm_snapshot', [])) as number;
};

export const restoreGanacheSnapshot = async (snapshot: number) => {
  await getTestProvider().send('evm_revert', [snapshot]);
};

const MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_1: TransactionGasDetails = {
  evmGasType: EVMGasType.Type1,
  gasEstimate: 0n,
  gasPrice: BigInt('0x1234567890'),
};
const MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2: TransactionGasDetails = {
  evmGasType: EVMGasType.Type2,
  gasEstimate: 0n,
  maxFeePerGas: BigInt('0x1234567890'),
  maxPriorityFeePerGas: BigInt('0x123456'),
};

const MOCK_RAILGUN_ADDRESS =
  '0zk1q8hxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kfrv7j6fe3z53llhxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kg0zpzts';

export const createQuickstartCrossContractCallsForTest = async (
  networkName: NetworkName,
  recipeInput: RecipeInput,
  recipeOutput: RecipeOutput,
): Promise<{
  gasEstimate: Optional<bigint>;
  transaction: ContractTransaction;
}> => {
  const railgunWallet = getTestRailgunWallet();

  const { erc20Amounts: unshieldERC20Amounts, nfts: unshieldNFTs } =
    recipeInput;
  const { minGasLimit } = recipeOutput;

  const { crossContractCalls, erc20AmountRecipients, nftRecipients } =
    recipeOutput;

  const shieldERC20Recipients: RailgunERC20Recipient[] =
    erc20AmountRecipients.map(erc20AmountRecipient => ({
      tokenAddress: erc20AmountRecipient.tokenAddress,
      recipientAddress: erc20AmountRecipient.recipient,
    }));

  const shieldNFTRecipients: RailgunNFTAmountRecipient[] = nftRecipients.map(
    nftRecipient => ({
      nftAddress: nftRecipient.nftAddress,
      nftTokenType: nftRecipient.nftTokenType,
      tokenSubID: nftRecipient.tokenSubID,
      amount: nftRecipient.amount,
      recipientAddress: nftRecipient.recipient,
    }),
  );

  if (unshieldERC20Amounts.length < 1) {
    throw new Error(
      'Test cross-contract call runner requires at least 1 unshield ERC20 amount.',
    );
  }

  // Proof/transaction requires relayer fee in order to parse the relay adapt error for testing.
  // Ie. RelayAdapt transaction must continue after revert, and emit event with error details.
  const mockRelayerFeeRecipient: RailgunERC20AmountRecipient = {
    tokenAddress: unshieldERC20Amounts[0].tokenAddress,
    amount: 0n,
    recipientAddress: MOCK_RAILGUN_ADDRESS,
  };

  let gasEstimate: Optional<bigint>;
  try {
    // const { gasEstimate: resolvedGasEstimate } =
      // await gasEstimateForUnprovenCrossContractCalls(
      //   networkName,
      //   railgunWallet.id,
      //   testConfig.encryptionKey,
      //   unshieldERC20Amounts,
      //   unshieldNFTs,
      //   shieldERC20Recipients,
      //   shieldNFTRecipients,
      //   crossContractCalls,
      //   MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      //   undefined, // feeTokenDetails
      //   true, // sendWithPublicWallet
      //   minGasLimit,
      // );

      //'[{"to":"0xCD021da010284100B81D3eef420e28451D232FAF","data":"0x1249c58b"},{"to":"0xCD021da010284100B81D3eef420e28451D232FAF","data":"0xccda57470000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fdd67e3241c190a8eb207289161c5c7024"},{"to":"0x3aB4dA0f8fa0E0Bb3db60ceE269c90Ea296b9a5b","data":"0x5596d148"}]'
    // gasEstimate = resolvedGasEstimate;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      'Received gas estimate error, which does not contain details of revert. Continuing transaction in order to parse RelayAdapt revert error.',
    );
    // eslint-disable-next-line no-console
    console.error(err);
  }

  await generateCrossContractCallsProof(
    networkName,
    railgunWallet.id,
    testConfig.encryptionKey,
    unshieldERC20Amounts,
    unshieldNFTs,
    shieldERC20Recipients,
    shieldNFTRecipients,
    crossContractCalls,
    mockRelayerFeeRecipient,
    false, // sendWithPublicWallet
    undefined, // overallBatchMinGasPrice
    minGasLimit,
    () => {}, // progressCallback
  );

  const transactionGasDetails: TransactionGasDetails = {
    ...MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_1,
    // gasEstimate: gasEstimate ?? minGasLimit,
    gasEstimate: 4_000_000n,
  };
  const { transaction } = await populateProvedCrossContractCalls(
    networkName,
    railgunWallet.id,
    unshieldERC20Amounts,
    unshieldNFTs,
    shieldERC20Recipients,
    shieldNFTRecipients,
    crossContractCalls,
    mockRelayerFeeRecipient,
    false, // sendWithPublicWallet
    undefined, // overallBatchMinGasPrice
    transactionGasDetails,
  );

  return { gasEstimate, transaction };
};
