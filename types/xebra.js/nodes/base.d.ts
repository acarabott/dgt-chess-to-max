import { EventEmitter } from "events";
import type { ParamNode } from "./paramNode";

/**
 * Unique ID associated with each XebraNode
 */
export type NodeId = number;

/**
 * Parameter value types that can be returned from getParamValue calls
 */
export type ParamValueType = string | number | boolean | (string | number | boolean)[] | null;

/**
 * Type for patching rectangles [x, y, width, height]
 */
export type PatchingRect = [number, number, number, number];

/**
 * @desc <strong>Constructor for internal use only</strong>
 * Base class for Max nodes in the Xebra state tree. Through Xebra, Max exposes patchers, mira.frame objects, other Max
 * objects and assignable parameters for each object. Each of these is represented by a different XebraNode subclass.
 */
export declare class XebraNode extends EventEmitter {
    /**
     * @param id The id of the node
     * @param type Type identifier of the node
     * @param creationSeq The sequence number for the creation of this node
     */
    constructor(id: NodeId, type: string, creationSeq: number);

    /**
     * Destroys the node by destroying all child nodes and removing all attached listeners.
     * @ignore
     */
    destroy(): void;

    /**
     * The creation sequence number associated with this node. This number is an increasing integer unique to each node.
     */
    get creationSequence(): number;

    /**
     * Unique id associated with each XebraNode.
     * @readonly
     */
    get id(): NodeId;

    /**
     * @desc Returns whether all of the parameters for the object have been added yet.
     * @readonly
     * @private
     */
    get isReady(): boolean;

    /**
     * Type associated with this node. For Objects, Frames and Patchers, this will correspond to the class name of the
     * Max object. For parameters, this will be the name of the associated parameter. Parameters usually correspond to
     * the name of a Max object's attribute.
     */
    get type(): string;

    /**
     * @private
     */
    _getParamForType(type: string): ParamNode | null;

    /**
     * Callback when a parameter value is changed due to a modification in Max.
     * @abstract
     * @method
     * @private
     */
    _onParamChange(): void;

    /**
     * Callback when a parameter value was set by the client.
     * @abstract
     * @method
     * @private
     */
    _onParamSet(): void;

    /**
     * Adds a child.
     * @ignore
     * @param id - The id of the child to be added
     * @param node - The child to add
     */
    addChild(id: NodeId, node: XebraNode): void;

    /**
     * Execute callback function for each child of the node.
     * @ignore
     * @param callback - The callback to execute
     * @param context - The context of the callback
     */
    forEachChild(
        callback: (node: XebraNode, id: NodeId, map: Map<NodeId, XebraNode>) => void,
        context?: any,
    ): void;

    /**
     * Returns the child with the given id.
     * @ignore
     * @param id - The ID of the child to retrieve
     * @return The child node or null if not found
     */
    getChild(id: NodeId): XebraNode | null;

    /**
     * Returns all children of the node.
     * @ignore
     * @return Array of child nodes
     */
    getChildren(): XebraNode[];

    /**
     * Returns whether the given id is a direct child.
     * @ignore
     * @param id - The id of the potential child
     * @return Whether the node has a child with the given ID
     */
    hasChild(id: NodeId): boolean;

    /**
     * Removes the direct child connection to the node with the given id.
     * @ignore
     * @param id - The id of the child to remove the connection to
     * @return The removed child node or undefined
     */
    removeChild(id: NodeId): XebraNode | null;

    /**
     * Adds a Parameter node to this node's children. Also adds the node as a listener for the Parameter node, so local
     * and remote changes to that node will trigger {@link State.object_changed} events.
     * @ignore
     * @listens ParamNode#change
     * @listens ParamNode#set
     * @param param The parameter to add
     */
    addParam(param: ParamNode): void;

    /**
     * Returns a list of the names of all available parameters.
     * @return An array of parameter type names
     */
    getParamTypes(): readonly string[];

    /**
     * Returns a list of the parameters that are not required for this object to be initialized.
     * @ignore
     * @return An array of optional parameter type names
     */
    getOptionalParamTypes(): readonly string[];

    /**
     * Returns the value for the parameter with the name <i>type</i>.
     * @param type - Parameter type identifier
     * @return returns the value(s) of the given parameter type or null
     */
    getParamValue(type: string): ParamValueType;

    /**
     * Sets the value for the parameter with the name <i>type</i> to the given value.
     * @param type - Parameter type identifier
     * @param value - Parameter value
     */
    setParamValue(type: string, value: ParamValueType): void;

    protected _id: NodeId;
    protected _type: string;
    protected _creationSeq: number;
    protected _children: Map<NodeId, XebraNode>;
    protected _paramsNameLookup: Map<string, NodeId>;

    /**
     * Object Destroyed event
     * @event XebraNode.destroy
     * @param object The destroyed object
     */
    on(event: "destroy", listener: (object: XebraNode) => void): this;
    emit(event: "destroy", object: XebraNode): boolean;
}
