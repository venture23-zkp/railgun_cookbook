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

export interface TokenAdapterInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "cage"
      | "dec"
      | "deny"
      | "exit"
      | "gem"
      | "ilk"
      | "join"
      | "live"
      | "rely"
      | "vat"
      | "wards"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "LogNote"): EventFragment;

  encodeFunctionData(functionFragment: "cage", values?: undefined): string;
  encodeFunctionData(functionFragment: "dec", values?: undefined): string;
  encodeFunctionData(functionFragment: "deny", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "exit",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "gem", values?: undefined): string;
  encodeFunctionData(functionFragment: "ilk", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "join",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "live", values?: undefined): string;
  encodeFunctionData(functionFragment: "rely", values: [AddressLike]): string;
  encodeFunctionData(functionFragment: "vat", values?: undefined): string;
  encodeFunctionData(functionFragment: "wards", values: [AddressLike]): string;

  decodeFunctionResult(functionFragment: "cage", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "dec", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deny", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "exit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "gem", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ilk", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "join", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "live", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "rely", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "vat", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "wards", data: BytesLike): Result;
}

export namespace LogNoteEvent {
  export type InputTuple = [
    sig: BytesLike,
    usr: AddressLike,
    arg1: BytesLike,
    arg2: BytesLike,
    data: BytesLike
  ];
  export type OutputTuple = [
    sig: string,
    usr: string,
    arg1: string,
    arg2: string,
    data: string
  ];
  export interface OutputObject {
    sig: string;
    usr: string;
    arg1: string;
    arg2: string;
    data: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface TokenAdapter extends BaseContract {
  connect(runner?: ContractRunner | null): BaseContract;
  attach(addressOrName: AddressLike): this;
  deployed(): Promise<this>;

  interface: TokenAdapterInterface;

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

  cage: TypedContractMethod<[], [void], "nonpayable">;

  dec: TypedContractMethod<[], [bigint], "view">;

  deny: TypedContractMethod<[usr: AddressLike], [void], "nonpayable">;

  exit: TypedContractMethod<
    [guy: AddressLike, amt: BigNumberish],
    [void],
    "nonpayable"
  >;

  gem: TypedContractMethod<[], [string], "view">;

  ilk: TypedContractMethod<[], [string], "view">;

  join: TypedContractMethod<
    [urn: AddressLike, amt: BigNumberish],
    [void],
    "nonpayable"
  >;

  live: TypedContractMethod<[], [bigint], "view">;

  rely: TypedContractMethod<[usr: AddressLike], [void], "nonpayable">;

  vat: TypedContractMethod<[], [string], "view">;

  wards: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "cage"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "dec"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "deny"
  ): TypedContractMethod<[usr: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "exit"
  ): TypedContractMethod<
    [guy: AddressLike, amt: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "gem"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "ilk"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "join"
  ): TypedContractMethod<
    [urn: AddressLike, amt: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "live"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "rely"
  ): TypedContractMethod<[usr: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "vat"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "wards"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  getEvent(
    key: "LogNote"
  ): TypedContractEvent<
    LogNoteEvent.InputTuple,
    LogNoteEvent.OutputTuple,
    LogNoteEvent.OutputObject
  >;

  filters: {
    "LogNote(bytes4,address,bytes32,bytes32,bytes)": TypedContractEvent<
      LogNoteEvent.InputTuple,
      LogNoteEvent.OutputTuple,
      LogNoteEvent.OutputObject
    >;
    LogNote: TypedContractEvent<
      LogNoteEvent.InputTuple,
      LogNoteEvent.OutputTuple,
      LogNoteEvent.OutputObject
    >;
  };
}