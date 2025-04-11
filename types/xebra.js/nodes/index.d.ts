import type { NodeId } from "./base";
import { FrameNode } from "./frame";
import { PatcherNode } from "./patcher";
import { ObjectNode } from "./objectNode";
import { ParamNode } from "./paramNode";

/**
 * Factory function to get the appropriate instance for a given object type
 * @param id - The id of the object
 * @param type - The type of the object
 * @param creationSeq - The sequence number for the creation of this object
 * @param parentId - The id of the parent node
 * @return The appropriate node instance
 */
export function getInstanceForObjectType(
    id: NodeId,
    type: string,
    creationSeq: number,
    parentId: NodeId,
): PatcherNode | FrameNode | ObjectNode;

export { FrameNode, PatcherNode, ObjectNode, ParamNode };
