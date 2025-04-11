import XebraNode from "./base";
import type ParamNode from "./paramNode";

export class ObjectNode extends XebraNode {
    private _patcherId: number;
    private _isReady: boolean;

    constructor(id: number, type: string, creationSeq: number, patcherId: number);

    readonly isReady: boolean;
    readonly patcherId: number;

    // Events
    on(event: "initialized", listener: (object: ObjectNode) => void): this;
    on(
        event: "param_changed" | "param_set",
        listener: (object: ObjectNode, param: ParamNode) => void,
    ): this;

    // These methods are expected to be defined elsewhere in the inheritance chain or mixins
    getParamTypes(): string[];
    getOptionalParamTypes(): string[];
    getParamValue(type: string): unknown;
}
