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

export interface CdpManagerInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "cdpAllow"
      | "cdpCan"
      | "cdpi"
      | "count"
      | "enter"
      | "first"
      | "flux(bytes32,uint256,address,uint256)"
      | "flux(uint256,address,uint256)"
      | "frob"
      | "give"
      | "ilks"
      | "last"
      | "list"
      | "move"
      | "open"
      | "owns"
      | "quit"
      | "shift"
      | "urnAllow"
      | "urnCan"
      | "urns"
      | "vat"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "LogNote" | "NewCdp"): EventFragment;

  encodeFunctionData(
    functionFragment: "cdpAllow",
    values: [BigNumberish, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "cdpCan",
    values: [AddressLike, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "cdpi", values?: undefined): string;
  encodeFunctionData(functionFragment: "count", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "enter",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "first", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "flux(bytes32,uint256,address,uint256)",
    values: [BytesLike, BigNumberish, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "flux(uint256,address,uint256)",
    values: [BigNumberish, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "frob",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "give",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "ilks", values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: "last", values: [AddressLike]): string;
  encodeFunctionData(functionFragment: "list", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "move",
    values: [BigNumberish, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "open",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "owns", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "quit",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "shift",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "urnAllow",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "urnCan",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "urns", values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: "vat", values?: undefined): string;

  decodeFunctionResult(functionFragment: "cdpAllow", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "cdpCan", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "cdpi", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "count", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "enter", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "first", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "flux(bytes32,uint256,address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "flux(uint256,address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "frob", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "give", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ilks", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "last", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "list", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "move", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "open", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owns", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "quit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "shift", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "urnAllow", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "urnCan", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "urns", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "vat", data: BytesLike): Result;
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

export namespace NewCdpEvent {
  export type InputTuple = [
    usr: AddressLike,
    own: AddressLike,
    cdp: BigNumberish
  ];
  export type OutputTuple = [usr: string, own: string, cdp: bigint];
  export interface OutputObject {
    usr: string;
    own: string;
    cdp: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface CdpManager extends BaseContract {
  connect(runner?: ContractRunner | null): BaseContract;
  attach(addressOrName: AddressLike): this;
  deployed(): Promise<this>;

  interface: CdpManagerInterface;

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

  cdpAllow: TypedContractMethod<
    [cdp: BigNumberish, usr: AddressLike, ok: BigNumberish],
    [void],
    "nonpayable"
  >;

  cdpCan: TypedContractMethod<
    [arg0: AddressLike, arg1: BigNumberish, arg2: AddressLike],
    [bigint],
    "view"
  >;

  cdpi: TypedContractMethod<[], [bigint], "view">;

  count: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  enter: TypedContractMethod<
    [src: AddressLike, cdp: BigNumberish],
    [void],
    "nonpayable"
  >;

  first: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  "flux(bytes32,uint256,address,uint256)": TypedContractMethod<
    [ilk: BytesLike, cdp: BigNumberish, dst: AddressLike, wad: BigNumberish],
    [void],
    "nonpayable"
  >;

  "flux(uint256,address,uint256)": TypedContractMethod<
    [cdp: BigNumberish, dst: AddressLike, wad: BigNumberish],
    [void],
    "nonpayable"
  >;

  frob: TypedContractMethod<
    [cdp: BigNumberish, dink: BigNumberish, dart: BigNumberish],
    [void],
    "nonpayable"
  >;

  give: TypedContractMethod<
    [cdp: BigNumberish, dst: AddressLike],
    [void],
    "nonpayable"
  >;

  ilks: TypedContractMethod<[arg0: BigNumberish], [string], "view">;

  last: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  list: TypedContractMethod<
    [arg0: BigNumberish],
    [[bigint, bigint] & { prev: bigint; next: bigint }],
    "view"
  >;

  move: TypedContractMethod<
    [cdp: BigNumberish, dst: AddressLike, rad: BigNumberish],
    [void],
    "nonpayable"
  >;

  open: TypedContractMethod<
    [ilk: BytesLike, usr: AddressLike],
    [bigint],
    "nonpayable"
  >;

  owns: TypedContractMethod<[arg0: BigNumberish], [string], "view">;

  quit: TypedContractMethod<
    [cdp: BigNumberish, dst: AddressLike],
    [void],
    "nonpayable"
  >;

  shift: TypedContractMethod<
    [cdpSrc: BigNumberish, cdpDst: BigNumberish],
    [void],
    "nonpayable"
  >;

  urnAllow: TypedContractMethod<
    [usr: AddressLike, ok: BigNumberish],
    [void],
    "nonpayable"
  >;

  urnCan: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [bigint],
    "view"
  >;

  urns: TypedContractMethod<[arg0: BigNumberish], [string], "view">;

  vat: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "cdpAllow"
  ): TypedContractMethod<
    [cdp: BigNumberish, usr: AddressLike, ok: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "cdpCan"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: BigNumberish, arg2: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "cdpi"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "count"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "enter"
  ): TypedContractMethod<
    [src: AddressLike, cdp: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "first"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "flux(bytes32,uint256,address,uint256)"
  ): TypedContractMethod<
    [ilk: BytesLike, cdp: BigNumberish, dst: AddressLike, wad: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "flux(uint256,address,uint256)"
  ): TypedContractMethod<
    [cdp: BigNumberish, dst: AddressLike, wad: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "frob"
  ): TypedContractMethod<
    [cdp: BigNumberish, dink: BigNumberish, dart: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "give"
  ): TypedContractMethod<
    [cdp: BigNumberish, dst: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "ilks"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "last"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "list"
  ): TypedContractMethod<
    [arg0: BigNumberish],
    [[bigint, bigint] & { prev: bigint; next: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "move"
  ): TypedContractMethod<
    [cdp: BigNumberish, dst: AddressLike, rad: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "open"
  ): TypedContractMethod<
    [ilk: BytesLike, usr: AddressLike],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "owns"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "quit"
  ): TypedContractMethod<
    [cdp: BigNumberish, dst: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "shift"
  ): TypedContractMethod<
    [cdpSrc: BigNumberish, cdpDst: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "urnAllow"
  ): TypedContractMethod<
    [usr: AddressLike, ok: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "urnCan"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "urns"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "vat"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "LogNote"
  ): TypedContractEvent<
    LogNoteEvent.InputTuple,
    LogNoteEvent.OutputTuple,
    LogNoteEvent.OutputObject
  >;
  getEvent(
    key: "NewCdp"
  ): TypedContractEvent<
    NewCdpEvent.InputTuple,
    NewCdpEvent.OutputTuple,
    NewCdpEvent.OutputObject
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

    "NewCdp(address,address,uint256)": TypedContractEvent<
      NewCdpEvent.InputTuple,
      NewCdpEvent.OutputTuple,
      NewCdpEvent.OutputObject
    >;
    NewCdp: TypedContractEvent<
      NewCdpEvent.InputTuple,
      NewCdpEvent.OutputTuple,
      NewCdpEvent.OutputObject
    >;
  };
}