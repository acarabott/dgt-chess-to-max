import XebraNode from "./base";

export type ParamValueType = number | string | boolean | (number | string | boolean)[] | null;

export class ParamNode extends XebraNode {
    private _sequence: number;
    private _currentRemoteSequence: number;
    private _value: ParamValueType;
    private _types: string[] | string | null;

    constructor(id: number, type: string, creationSeq: number);

    readonly remoteSequence: number;
    readonly types: string[];
    readonly sequence: number;

    get value(): ParamValueType;
    set value(value: ParamValueType);

    init(value: ParamValueType): void;

    modify(value: ParamValueType, types: string[], remoteSequence: number): void;

    // Events
    on(event: "set" | "change", listener: (param: ParamNode) => void): this;
}
