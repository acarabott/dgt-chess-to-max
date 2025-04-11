/**
 * Filename for an empty XebraResource
 * @static
 * @constant
 * @memberof Xebra
 * @type {String}
 */
export const EMPTY_RESOURCE: "<none>";

/**
 * Motion Types supported by Xebra. Use these as type identifiers when calling sendMotionData on Xebra.State.
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {string} ACCEL - Acceleration, minus any acceleration due to gravity
 * @property {string} GRAVITY - Acceleration due to gravity
 * @property {string} ORIENTATION - Roll, pitch and yaw
 * @property {string} RAWACCEL - Raw acceleration, including both user acceleration as well as gravity
 * @property {string} ROTATIONRATE - Raw gyroscope readings: x, y and z rotation rates
 */
export const MOTION_TYPES: {
    readonly ROTATIONRATE: "rotationrate";
    readonly GRAVITY: "gravity";
    readonly ACCEL: "accel";
    readonly ORIENTATION: "orientation";
    readonly RAWACCEL: "rawaccel";
};

/**
 * Unit Styles of live.* objects.
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {string} LIVE_UNIT_INT - Integer Unit Style
 * @property {string} LIVE_UNIT_FLOAT - Float Unit Style
 * @property {string} LIVE_UNIT_TIME - Time Unit Style
 * @property {string} LIVE_UNIT_HZ - Hertz Unit Style
 * @property {string} LIVE_UNIT_DB - deciBel Unit Style
 * @property {string} LIVE_UNIT_PERCENT - Percent (%) Unit Style
 * @property {string} LIVE_UNIT_PAN - Pan Unit Style
 * @property {string} LIVE_UNIT_SEMITONES - Semitones Unit Stlye
 * @property {string} LIVE_UNIT_MIDI - MIDI Notes Unit Style
 * @property {string} LIVE_UNIT_CUSTOM - Custom Unit Style
 * @property {string} LIVE_UNIT_NATIVE - Native Unit Style
 */
export const LIVE_UNIT_STYLES: {
    readonly LIVE_UNIT_INT: "Int";
    readonly LIVE_UNIT_FLOAT: "Float";
    readonly LIVE_UNIT_TIME: "Time";
    readonly LIVE_UNIT_HZ: "Hertz";
    readonly LIVE_UNIT_DB: "deciBel";
    readonly LIVE_UNIT_PERCENT: "%";
    readonly LIVE_UNIT_PAN: "Pan";
    readonly LIVE_UNIT_SEMITONES: "Semitones";
    readonly LIVE_UNIT_MIDI: "MIDI";
    readonly LIVE_UNIT_CUSTOM: "Custom";
    readonly LIVE_UNIT_NATIVE: "Native";
};

export type LIVE_UNIT_STYLES = (typeof LIVE_UNIT_STYLES)[keyof typeof LIVE_UNIT_STYLES];

/**
 * Unit Styles of live.* objects.
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {string} LIVE_UNIT_INT - Integer Unit Style
 */
export const LIVE_VALUE_TYPES: {
    readonly FLOAT: "Float";
    readonly ENUM: "Enum";
    readonly INT: "Int (0-255)";
};
export type LIVE_VALUE_TYPES = (typeof LIVE_VALUE_TYPES)[keyof typeof LIVE_VALUE_TYPES];

/**
 * Available View Modes of XebraState.
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {number} LINKED - Calculate visibility and position using the same view mode as Max
 * @property {number} PRESENTATION - Calculate visibility and position always using Presentation Mode
 * @property {number} PATCHING - Calculate visibility and position always using Patching Mode
 */
export const VIEW_MODES: {
    readonly LINKED: 1;
    readonly PRESENTATION: 2;
    readonly PATCHING: 4;
};
