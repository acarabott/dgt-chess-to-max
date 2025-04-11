import { ObjectNode } from "./objectNode";
import type { NodeId, PatchingRect } from "./base";

/**
 * @desc <strong>Constructor for internal use only</strong>
 *
 * FrameNode instances represent mira.frame objects in a Max patcher. Using the FrameNode object, it is possible to see
 * which Max objects intersect a given mira.frame object, in both Patching as well as Presentation Modes.
 */
export declare class FrameNode extends ObjectNode {
    /**
     * @param id - The id of the node
     * @param type - Type identifier of the node
     * @param creationSeq - The sequence number for the creation of this node
     * @param patcherId - The id of the parent node
     */
    constructor(id: NodeId, type: string, creationSeq: number, patcherId: NodeId);

    /**
     * The view mode of the FrameNode. In Patching mode, object positions and visibility will be calculated relative to
     * the patching_rect of the mira.frame object. In Presentation mode, the presentation_rect will be used. Linked mode
     * will defer to Max. If Max is in Presentation mode, Xebra will use Presentation mode, and if Max is in Patching
     * mode, Xebra will use Patching mode as well.
     * @see Xebra.VIEW_MODES
     */
    get viewMode(): number;
    set viewMode(mode: number);

    /**
     * Sets the view mode of the containing patcher
     * @private
     */
    get patcherViewMode(): number;
    set patcherViewMode(mode: number);

    /**
     * @private
     * @fires XebraState.object_added
     * @param obj - The new object
     */
    private _onObjectInitialized: (obj: ObjectNode) => void;

    /**
     * @private
     * @fires XebraState.object_changed
     * @param obj - The changed object
     * @param param - The changed parameter
     */
    private _onObjectChange: (obj: ObjectNode, param: ParamNode) => void;

    /**
     * Callback called when a contained object is destroyed.
     * @private
     * @param obj - The destroyed object
     */
    private _onObjectDestroy: (obj: ObjectNode) => void;

    /**
     * Adds the given object to the frame.
     * @ignore
     * @param obj - The object to add
     * @listens ObjectNode.param_changed
     * @listens ObjectNode.destroy
     * @fires XebraState.object_added
     */
    addObject(obj: ObjectNode): void;

    /**
     * Checks whether the frame contains the object identified by the given id.
     * @param id - The id of the object
     * @return Whether the frame contains the object
     */
    containsObject(id: NodeId): boolean;

    /**
     * Boundary check whether the given rect is visible within the frame.
     * @param rect - The rectangle to check
     * @return whether the rect is contained or not
     */
    containsRect(rect: PatchingRect): boolean;

    /**
     * Returns the object with the given id.
     * @param id - The id of the object
     * @return The object (if contained) or null
     */
    getObject(id: NodeId): ObjectNode | null;

    /**
     * Returns a list of all objects contained in the frame.
     * @return An array of all contained objects
     */
    getObjects(): ObjectNode[];

    /**
     * Returns the frame of the object relative the the frame, in the current view mode, or null if the object is not in
     * the frame.
     * @param object - The object to get the relative rect for
     * @return Relative object frame or null if not in frame
     */
    getRelativeRect(object: ObjectNode): PatchingRect | null;

    /**
     * Checks whether the current view mode is linked.
     * @return Whether the frame defers to Max for it's viewMode or not
     */
    isViewModeLinked(): boolean;

    /**
     * Removes the object with the given id from the frame.
     * @ignore
     * @fires XebraState.object_removed
     * @param id - The id of the object to remove
     */
    removeObject(id: NodeId): void;

    protected _objects: Set<NodeId>;
    protected _viewMode: number;
    protected _patcherViewMode: number;

    emit(event: "object_added", object: ObjectNode): boolean;
    emit(event: "object_changed" | "object_removed", object: ObjectNode, param: ParamNode): boolean;
    emit(event: "viewmode_change", frame: FrameNode, viewMode: number): boolean;

    on(event: "object_changed", listener: (object: ObjectNode, param: ParamNode) => void): this;
    on(event: "object_added" | "object_removed", listener: (object: ObjectNode) => void): this;
    on(event: "viewmode_change", listener: (frame: FrameNode, viewMode: number) => void): this;
}
