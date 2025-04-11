import { EventEmitter } from "events";
import type { NodeId } from "../index";

/**
 * @typedef {object} ResourceDimensions
 * @property {number} height The height
 * @property {number} width The width
 */
export interface ResourceDimensions {
    height: number;
    width: number;
}

interface ResourceDataRequest {
    context: NodeId;
    name: string;
    width: number;
    height: number;
    sequence: number;
}

interface ResourceData {
    request: ResourceDataRequest;
    data: string;
}

/**
 * @desc Represents some data that the remote Max instance has access to. The intended use is to support Max objects
 * like fpic and live.tab, which may want to display images. Can also be used to fetch data from files in Max's search
 * path. Setting `filename` (or setting `dimensions` in the case of .svg files) will query Max for that data in Max's
 * search path. Listen for the {@link Resource.event:data_received} event to receive the data as a data URI string.
 * Only images are currently supported.
 * @class
 * @extends EventEmitter
 * @example
 * // To use a resource without an ObjectNode, first create the resource.
 * const xebraState; // Instance of Xebra.State
 * const resource = xebraState.createResource();
 *
 * // The resource doesn't hold on to data from Max once it receives it, so be sure to listen for {@link Resource.event:data_received}
 * // events in order to handle resource data.
 * resource.on("data_received", (filename, data_uri) => {
 * // Do something with the data
 * });
 *
 * // Setting the filename property will cause the Resource object to fetch the data from Max. filename should be the
 * // name of a file in Max's search path. If Max is able to load the file successfully, it will send the data back
 * // to the Resource object, which will fire a {@link Resource.event:data_received} event with the data and filename.
 * resource.filename = "alex.png";
 *
 * // If the requested file is an .svg file, then Max will render the file before sending the data back to the Resource
 * // object. In this case, the dimensions property of the resource must be set as well as filename.
 * resource.filename = "maxelement.svg";
 * resource.dimensions = {width: 100, height: 50};
 */
export class Resource extends EventEmitter {
    /**
     * @constructor
     * @param  {NodeId} [parentObjectId=0] - The id of the ObjectNode that owns this resource
     */
    constructor(parentObjectId?: NodeId);

    /**
     * Unique identifier associated with each resource.
     * @readonly
     * @type {NodeId}
     */
    readonly id: NodeId;

    /**
     * Name of a file in Max's search path. Setting this will query Max for data from the corresponding file. Listen to
     * the {@link Resource.event:data_received} event for the data in the form of a data-uri string.
     * @type {string}
     */
    filename: string;

    /**
     * Id of the ObjectNode that owns the resource. If the resource is not bound to an ObjectNode, returns null. Max can
     * use the object id to augment the search path with the parent patcher of the object, if the object id is supplied.
     * @type {NodeId}
     */
    readonly objectContext: NodeId;

    /**
     * Whether the resource has empty content
     * @readonly
     * @type {boolean}
     */
    readonly isEmpty: boolean;

    /**
     * Whether the resource is a SVG image or not
     * @readonly
     * @type {boolean}
     */
    readonly isSVG: boolean;

    /**
     * Dimensions of the resource. These are <strong>not</strong> updated automatically, and <strong>cannot</strong> be
     * used to determine the dimensions of a raster image in Max's filepath. Instead, use the data URI returned with the
     * {@link Resource.event:data_received} event to determine size. Setting these dimensions will trigger a new data
     * fetch, if the resource is an .svg image. Max will be used to render the image and a .png data-uri will be
     * returned.
     * @type {ResourceDimensions}
     */
    dimensions: ResourceDimensions;

    /**
     * Clears the resource content
     * @private
     */
    clear(): void;

    /**
     * Be sure to call this when the Resource is no longer needed.
     */
    destroy(): void;

    /**
     * Handle incoming resource data.
     * @private
     * @param {ResourceData} data - The resource data
     */
    handleData(data: ResourceData): void;

    // Event declarations
    on(event: "clear" | "destroy", listener: () => void): this;
    on(event: "needs_data", listener: (resource: Resource) => void): this;
    on(event: "data_received", listener: (name: string, dataUri: string) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;

    once(event: "clear" | "destroy", listener: () => void): this;
    once(event: "needs_data", listener: (resource: Resource) => void): this;
    once(event: "data_received", listener: (name: string, dataUri: string) => void): this;
    once(event: string, listener: (...args: unknown[]) => void): this;
}

export class ResourceController extends EventEmitter {
    constructor();

    /**
     * Create a Resource object
     * @param {NodeId} [parentObjectId=0] - The id of the ObjectNode that owns this resource
     * @returns {Resource} The created resource
     */
    createResource(parentObjectId?: NodeId): Resource;

    // Event declarations
    on(event: "get_resource_info", listener: (resource: Resource) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
}
