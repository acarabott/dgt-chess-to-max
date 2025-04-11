import { EventEmitter } from "events";
import {
    MOTION_TYPES,
    VIEW_MODES,
    LIVE_UNIT_STYLES,
    LIVE_VALUE_TYPES,
    EMPTY_RESOURCE,
} from "./lib/constants";
import {
    OBJECTS,
    PARAMETER_ATTR,
    MANDATORY_OBJECTS,
    DEFAULT_PARAMS,
    OBJECT_PARAMETERS,
    OPTIONAL_OBJECT_PARAMETERS,
} from "./lib/objectList";
import { ResourceController } from "./lib/resource";
import type { ObjectNode, ParamNode, PatcherNode } from "./nodes/index";

export * from "./lib/constants";

declare module "xebra.js" {
    export {
        OBJECTS,
        PARAMETER_ATTR,
        MANDATORY_OBJECTS,
        MOTION_TYPES,
        VIEW_MODES,
        LIVE_UNIT_STYLES,
        LIVE_VALUE_TYPES,
        EMPTY_RESOURCE,
        DEFAULT_PARAMS,
        OBJECT_PARAMETERS,
        OPTIONAL_OBJECT_PARAMETERS,
        ResourceController,
    };

    /**
     * List of objects available for synchronization in Xebra. Use this or a subset of this when setting the
     * supported_objects option in Xebra.State.
     *
     * @static
     * @constant
     * @memberof Xebra
     * @type {string[]}
     */
    export const SUPPORTED_OBJECTS: readonly string[];

    /**
     * Connection States
     * @static
     * @constant
     * @memberof Xebra
     * @type {object}
     * @property {number} INIT - The connection hasn't been set up yet, it's still waiting for a call to connect (unless
     *     auto_connect is set to true)
     * @property {number} CONNECTING - The connection is being established
     * @property {number} CONNECTED - The connection is established and alive
     * @property {number} CONNECTION_FAIL - The connection could NEVER be established
     * @property {number} RECONNECTING - The connection was lost and attempts to reconnect are made (based on reconnect,
     *     reconnect_attempts and reconnect_timeout options)
     * @property {number} DISCONNECTED - The connection was lost and all attempts to reconnect failed
     */
    export const CONNECTION_STATES: {
        readonly INIT: number;
        readonly CONNECTING: number;
        readonly CONNECTED: number;
        readonly CONNECTION_FAIL: number;
        readonly RECONNECTING: number;
        readonly DISCONNECTED: number;
    };

    export const VERSION: string;

    /**
     * A string or number based id
     */
    export type NodeId = number | string;

    /**
     * Patching Rectangle attribute consisting of 4 Numbers (x, y, width, height)
     */
    export type PatchingRect = [number, number, number, number];

    /**
     * Generic parameter value type
     */
    export type ParamValueType = number | string | string[] | number[] | Record<string, unknown>;

    /**
     * Color attribute consisting of 4 Numbers in the format of [r, g, b, a]
     */
    export type Color = [number, number, number, number];

    /**
     * Object definition for custom objects in supported_objects
     */
    export interface ObjectDefinition {
        name: string;
        parameters: string[];
    }

    export interface StateOptions {
        auto_connect?: boolean;
        hostname: string;
        port: number;
        secure?: boolean;
        reconnect?: boolean;
        reconnect_attempts?: number;
        reconnect_timeout?: number;
        supported_objects?: (string | ObjectDefinition)[];
    }

    /**
     * @desc State instances wrap the state sync and connection with the Max backend.
     * @class
     */
    export class State extends EventEmitter {
        /**
         * @param  {StateOptions} options
         */
        constructor(options: StateOptions);

        /**
         * Returns whether motion tracking is currently enabled/disabled.
         * @type {boolean}
         * @readonly
         */
        readonly isMotionEnabled: boolean;

        /**
         * Returns the current connection state.
         * @type {number}
         * @readonly
         * @see {Xebra.CONNECTION_STATES}
         */
        readonly connectionState: number;

        /**
         * Name of the current xebra connection. For some Max objects, like mira.motion and mira.multitouch, multiple xebra
         * clients (connected via Xebra.js or the Mira iOS app) can send events to the same object. This name property will
         * be appended to these events, so that the events can be routed in Max.
         * @type {string}
         */
        name: string;

        /**
         * Hostname of the Max WebSocket.
         * @type {string}
         * @readonly
         */
        readonly hostname: string;

        /**
         * Returns whether the initial state has been received from Max and loaded.
         * @type {boolean}
         * @readonly
         */
        readonly isStateLoaded: boolean;

        /**
         * Returns the port number of the Max WebSocket.
         * @type {number}
         * @readonly
         */
        readonly port: number;

        /**
         * WebSocket connection URL.
         * @type {string}
         * @readonly
         */
        readonly wsUrl: string;

        /**
         * UUID associated with this state.
         * @type {string}
         * @readonly
         */
        readonly uuid: string;

        /**
         * UID assigned to this state by Max, after connection.
         * @private
         * @readonly
         */
        private readonly xebraUuid: string;

        /**
         * Closes the Xebra connection and resets the state.
         */
        close(): void;

        /**
         * Connects to the Xebra server. If `auto_connect : true` is passed to State on.
         */
        connect(): void;

        /**
         * Create a {@link Resource}, which can be used to retrieve image data from the Max search path.
         * @return {Resource}
         */
        createResource(): Resource;

        /**
         * Send an arbitrary message to the named channel. The type of the message will be coerced to
         * a Max type in the Max application by mira.channel
         * @param {string} channel - The name of the mira.channel objects that should receive this message
         * @param {number|string|Array<number>|Array<string>|Record<string, unknown>} message - the message to send
         */
        sendMessageToChannel(
            channel: string,
            message: number | string | number[] | string[] | Record<string, unknown>,
        ): void;

        /**
         * Send mira.motion updates to parameters on the root node.
         * @see Xebra.MOTION_TYPES
         * @param {string} motionType - The type of motion
         * @param {number} motionX
         * @param {number} motionY
         * @param {number} motionZ
         * @param {number} timestamp
         * @throws Will throw an error when motion is currently disabled on the instance of State.
         */
        sendMotionData(
            motionType: string,
            motionX: number,
            motionY: number,
            motionZ: number,
            timestamp: number,
        ): void;

        /**
         * Returns a list of the names of all mira.channel objects in all patchers
         * @return {string[]}
         */
        getChannelNames(): string[];

        /**
         * Returns a list of available patchers.
         * @return {Array<PatcherNode>}
         */
        getPatchers(): PatcherNode[];

        /**
         * Returns a list of node objects with the given scripting name (the Max attribute 'varname').
         * @return {Array<ObjectNode>}
         */
        getObjectsByScriptingName(scriptingName: string): ObjectNode[];

        /**
         * Returns the object specified by the given id.
         * @param {NodeId} id - The id of the object
         * @return {ObjectNode|null} the object or null if not known
         */
        getObjectById(id: NodeId): ObjectNode | null;

        /**
         * Returns the patcher specified by the given id.
         * @param {NodeId} id - The id of the patcher
         * @return {PatcherNode|null} the patcher or null if not known
         */
        getPatcherById(id: NodeId): PatcherNode | null;

        // Events
        on(event: "connection_changed", listener: (status: number) => void): this;
        on(event: "frame_changed", listener: (frame: FrameNode, param: ParamNode) => void): this;
        on(
            event: "patcher_changed",
            listener: (patcher: PatcherNode, param: ParamNode) => void,
        ): this;
        on(event: "object_changed", listener: (object: ObjectNode, param: ParamNode) => void): this;
        on(event: "object_added" | "object_removed", listener: (object: ObjectNode) => void): this;
        on(event: "frame_added" | "frame_removed", listener: (frame: FrameNode) => void): this;
        on(
            event: "patcher_added" | "patcher_removed",
            listener: (patcher: PatcherNode) => void,
        ): this;
        on(
            event: "motion_enabled" | "motion_disabled" | "reset" | "loaded",
            listener: () => void,
        ): this;
        on(
            event: "channel_message_received",
            listener: (
                channel: string,
                message: number | string | (number | string)[] | Record<string, unknown>,
            ) => void,
        ): this;
        on(event: "client_param_changed", listener: (key: string, value: string) => void): this;
        on(event: string, listener: (...args: unknown[]) => void): this;
    }
}
