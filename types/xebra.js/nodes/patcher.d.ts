import { ObjectNode } from "./objectNode";

export class PatcherNode extends ObjectNode {
    private _frames: Set<number>;
    private _objects: Set<number>;
    private _idsByScriptingName: Map<string, number>;
    private _scriptingNamesById: Map<number, string>;
    private _view: ObjectNode | null;

    constructor(id: number, type: string, creationSeq: number, parentId: number);

    readonly name: string;
    readonly locked: boolean;
    readonly bgColor: number[]; // [r, g, b, a]
    readonly viewMode: number;

    addFrame(frame: ObjectNode): void;
    addObject(obj: ObjectNode): void;

    getChannelNames(): string[];
    getFrame(id: number): ObjectNode | null;
    getFrames(): ObjectNode[];
    getObject(id: number): ObjectNode | null;
    getObjectByScriptingName(scriptingName: string): ObjectNode | null;
    getObjects(): ObjectNode[];

    removeFrame(id: number): void;
    removeObject(id: number): void;

    // Events
    on(
        event:
            | "frame_added"
            | "frame_removed"
            | "frame_changed"
            | "object_added"
            | "object_removed"
            | "object_changed"
            | "param_changed",
        listener: (...args: unknown[]) => void,
    ): this;
}
