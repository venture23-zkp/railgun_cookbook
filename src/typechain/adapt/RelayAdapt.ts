/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export type G1PointStruct = { x: BigNumberish; y: BigNumberish };

export type G1PointStructOutput = [x: bigint, y: bigint] & {
  x: bigint;
  y: bigint;
};

export type G2PointStruct = {
  x: [BigNumberish, BigNumberish];
  y: [BigNumberish, BigNumberish];
};

export type G2PointStructOutput = [x: [bigint, bigint], y: [bigint, bigint]] & {
  x: [bigint, bigint];
  y: [bigint, bigint];
};

export type SnarkProofStruct = {
  a: G1PointStruct;
  b: G2PointStruct;
  c: G1PointStruct;
};

export type SnarkProofStructOutput = [
  a: G1PointStructOutput,
  b: G2PointStructOutput,
  c: G1PointStructOutput
] & { a: G1PointStructOutput; b: G2PointStructOutput; c: G1PointStructOutput };

export type CommitmentCiphertextStruct = {
  ciphertext: [BytesLike, BytesLike, BytesLike, BytesLike];
  blindedSenderViewingKey: BytesLike;
  blindedReceiverViewingKey: BytesLike;
  annotationData: BytesLike;
  memo: BytesLike;
};

export type CommitmentCiphertextStructOutput = [
  ciphertext: [string, string, string, string],
  blindedSenderViewingKey: string,
  blindedReceiverViewingKey: string,
  annotationData: string,
  memo: string
] & {
  ciphertext: [string, string, string, string];
  blindedSenderViewingKey: string;
  blindedReceiverViewingKey: string;
  annotationData: string;
  memo: string;
};

export type BoundParamsStruct = {
  treeNumber: BigNumberish;
  minGasPrice: BigNumberish;
  unshield: BigNumberish;
  chainID: BigNumberish;
  adaptContract: AddressLike;
  adaptParams: BytesLike;
  commitmentCiphertext: CommitmentCiphertextStruct[];
};

export type BoundParamsStructOutput = [
  treeNumber: bigint,
  minGasPrice: bigint,
  unshield: bigint,
  chainID: bigint,
  adaptContract: string,
  adaptParams: string,
  commitmentCiphertext: CommitmentCiphertextStructOutput[]
] & {
  treeNumber: bigint;
  minGasPrice: bigint;
  unshield: bigint;
  chainID: bigint;
  adaptContract: string;
  adaptParams: string;
  commitmentCiphertext: CommitmentCiphertextStructOutput[];
};

export type TokenDataStruct = {
  tokenType: BigNumberish;
  tokenAddress: AddressLike;
  tokenSubID: BigNumberish;
};

export type TokenDataStructOutput = [
  tokenType: bigint,
  tokenAddress: string,
  tokenSubID: bigint
] & { tokenType: bigint; tokenAddress: string; tokenSubID: bigint };

export type CommitmentPreimageStruct = {
  npk: BytesLike;
  token: TokenDataStruct;
  value: BigNumberish;
};

export type CommitmentPreimageStructOutput = [
  npk: string,
  token: TokenDataStructOutput,
  value: bigint
] & { npk: string; token: TokenDataStructOutput; value: bigint };

export type TransactionStruct = {
  proof: SnarkProofStruct;
  merkleRoot: BytesLike;
  nullifiers: BytesLike[];
  commitments: BytesLike[];
  boundParams: BoundParamsStruct;
  unshieldPreimage: CommitmentPreimageStruct;
};

export type TransactionStructOutput = [
  proof: SnarkProofStructOutput,
  merkleRoot: string,
  nullifiers: string[],
  commitments: string[],
  boundParams: BoundParamsStructOutput,
  unshieldPreimage: CommitmentPreimageStructOutput
] & {
  proof: SnarkProofStructOutput;
  merkleRoot: string;
  nullifiers: string[];
  commitments: string[];
  boundParams: BoundParamsStructOutput;
  unshieldPreimage: CommitmentPreimageStructOutput;
};

export type ShieldCiphertextStruct = {
  encryptedBundle: [BytesLike, BytesLike, BytesLike];
  shieldKey: BytesLike;
};

export type ShieldCiphertextStructOutput = [
  encryptedBundle: [string, string, string],
  shieldKey: string
] & { encryptedBundle: [string, string, string]; shieldKey: string };

export type ShieldRequestStruct = {
  preimage: CommitmentPreimageStruct;
  ciphertext: ShieldCiphertextStruct;
};

export type ShieldRequestStructOutput = [
  preimage: CommitmentPreimageStructOutput,
  ciphertext: ShieldCiphertextStructOutput
] & {
  preimage: CommitmentPreimageStructOutput;
  ciphertext: ShieldCiphertextStructOutput;
};

export declare namespace RelayAdapt {
  export type CallStruct = {
    to: AddressLike;
    data: BytesLike;
    value: BigNumberish;
  };

  export type CallStructOutput = [to: string, data: string, value: bigint] & {
    to: string;
    data: string;
    value: bigint;
  };

  export type ActionDataStruct = {
    random: BytesLike;
    requireSuccess: boolean;
    minGasLimit: BigNumberish;
    calls: RelayAdapt.CallStruct[];
  };

  export type ActionDataStructOutput = [
    random: string,
    requireSuccess: boolean,
    minGasLimit: bigint,
    calls: RelayAdapt.CallStructOutput[]
  ] & {
    random: string;
    requireSuccess: boolean;
    minGasLimit: bigint;
    calls: RelayAdapt.CallStructOutput[];
  };

  export type TokenTransferStruct = {
    token: TokenDataStruct;
    to: AddressLike;
    value: BigNumberish;
  };

  export type TokenTransferStructOutput = [
    token: TokenDataStructOutput,
    to: string,
    value: bigint
  ] & { token: TokenDataStructOutput; to: string; value: bigint };
}

export interface RelayAdaptInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "accountRegistry"
      | "createNftAccounts"
      | "getAdaptParams"
      | "multicall"
      | "onERC721Received"
      | "railgun"
      | "receivedERC721"
      | "relay"
      | "shield"
      | "tokenContracts"
      | "transfer"
      | "unwrapBase"
      | "wBase"
      | "wrapBase"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "CallError"): EventFragment;

  encodeFunctionData(
    functionFragment: "accountRegistry",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "createNftAccounts",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAdaptParams",
    values: [TransactionStruct[], RelayAdapt.ActionDataStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "multicall",
    values: [boolean, RelayAdapt.CallStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC721Received",
    values: [AddressLike, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "railgun", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "receivedERC721",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "relay",
    values: [TransactionStruct[], RelayAdapt.ActionDataStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "shield",
    values: [ShieldRequestStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenContracts",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [RelayAdapt.TokenTransferStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "unwrapBase",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "wBase", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "wrapBase",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "accountRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createNftAccounts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAdaptParams",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "multicall", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "onERC721Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "railgun", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "receivedERC721",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "relay", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "shield", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenContracts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unwrapBase", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "wBase", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "wrapBase", data: BytesLike): Result;
}

export namespace CallErrorEvent {
  export type InputTuple = [callIndex: BigNumberish, revertReason: BytesLike];
  export type OutputTuple = [callIndex: bigint, revertReason: string];
  export interface OutputObject {
    callIndex: bigint;
    revertReason: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface RelayAdapt extends BaseContract {
  connect(runner?: ContractRunner | null): BaseContract;
  attach(addressOrName: AddressLike): this;
  deployed(): Promise<this>;

  interface: RelayAdaptInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  accountRegistry: TypedContractMethod<[], [string], "view">;

  createNftAccounts: TypedContractMethod<[], [void], "nonpayable">;

  getAdaptParams: TypedContractMethod<
    [
      _transactions: TransactionStruct[],
      _actionData: RelayAdapt.ActionDataStruct
    ],
    [string],
    "view"
  >;

  multicall: TypedContractMethod<
    [_requireSuccess: boolean, _calls: RelayAdapt.CallStruct[]],
    [void],
    "payable"
  >;

  onERC721Received: TypedContractMethod<
    [
      arg0: AddressLike,
      arg1: AddressLike,
      tokenId: BigNumberish,
      arg3: BytesLike
    ],
    [string],
    "nonpayable"
  >;

  railgun: TypedContractMethod<[], [string], "view">;

  receivedERC721: TypedContractMethod<
    [arg0: AddressLike, arg1: BigNumberish],
    [bigint],
    "view"
  >;

  relay: TypedContractMethod<
    [
      _transactions: TransactionStruct[],
      _actionData: RelayAdapt.ActionDataStruct
    ],
    [void],
    "payable"
  >;

  shield: TypedContractMethod<
    [_shieldRequests: ShieldRequestStruct[]],
    [void],
    "nonpayable"
  >;

  tokenContracts: TypedContractMethod<[arg0: BigNumberish], [string], "view">;

  transfer: TypedContractMethod<
    [_transfers: RelayAdapt.TokenTransferStruct[]],
    [void],
    "nonpayable"
  >;

  unwrapBase: TypedContractMethod<
    [_amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  wBase: TypedContractMethod<[], [string], "view">;

  wrapBase: TypedContractMethod<[_amount: BigNumberish], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "accountRegistry"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "createNftAccounts"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "getAdaptParams"
  ): TypedContractMethod<
    [
      _transactions: TransactionStruct[],
      _actionData: RelayAdapt.ActionDataStruct
    ],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "multicall"
  ): TypedContractMethod<
    [_requireSuccess: boolean, _calls: RelayAdapt.CallStruct[]],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "onERC721Received"
  ): TypedContractMethod<
    [
      arg0: AddressLike,
      arg1: AddressLike,
      tokenId: BigNumberish,
      arg3: BytesLike
    ],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "railgun"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "receivedERC721"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "relay"
  ): TypedContractMethod<
    [
      _transactions: TransactionStruct[],
      _actionData: RelayAdapt.ActionDataStruct
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "shield"
  ): TypedContractMethod<
    [_shieldRequests: ShieldRequestStruct[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "tokenContracts"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "transfer"
  ): TypedContractMethod<
    [_transfers: RelayAdapt.TokenTransferStruct[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "unwrapBase"
  ): TypedContractMethod<[_amount: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "wBase"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "wrapBase"
  ): TypedContractMethod<[_amount: BigNumberish], [void], "nonpayable">;

  getEvent(
    key: "CallError"
  ): TypedContractEvent<
    CallErrorEvent.InputTuple,
    CallErrorEvent.OutputTuple,
    CallErrorEvent.OutputObject
  >;

  filters: {
    "CallError(uint256,bytes)": TypedContractEvent<
      CallErrorEvent.InputTuple,
      CallErrorEvent.OutputTuple,
      CallErrorEvent.OutputObject
    >;
    CallError: TypedContractEvent<
      CallErrorEvent.InputTuple,
      CallErrorEvent.OutputTuple,
      CallErrorEvent.OutputObject
    >;
  };
}
