import { ParamValueType } from "./base";
import { LIVE_UNIT_STYLES, LIVE_VALUE_TYPES } from "../lib/constants";
import { ObjectNode } from "./objectNode";

/**
 * Generate a formatted string representation of a value based on unit style
 * @param liveValue - The value to format
 * @param unitStyle - The unit style to apply
 * @param paramValueType - The type of parameter value
 * @param customUnit - Custom unit string (if applicable)
 * @return The formatted value as a string
 */
export function stringForLiveValue(
    liveValue: number | undefined,
    unitStyle: LIVE_UNIT_STYLES | undefined,
    paramValueType: LIVE_VALUE_TYPES,
    customUnit: string,
): string;

/**
 * Adds a virtual, readonly "displayvalue" parameter to the object in order to simplify reading the different display
 * and unit styles of certain live objects.
 *
 * For example, if the value of the "distance" parameter is 0.5, then depending on the configuration of the object, the
 * "displayvalue" parameter could be "400 Hz" or "C3#".
 *
 * This mixin is currently added to ObjectNodes representing live.dial, live.numbox and live.slider objects.
 *
 * @example
 * // dialNode is the ObjectNode for the live.dial
 * dialNode.setParamValue("_parameter_range", [10, 20]);
 * dialNode.setParamValue("_parameter_exponent", 1);
 * dialNode.setParamValue("distance", 0.5);
 * dialNode.setParamValue("_parameter_unitstyle", "Pan");
 * dialNode.getParamValue("displayvalue"); // returns "15R"
 *
 * dialNode.setParamValue("_parameter_unitstyle", "Semitones");
 * dialNode.getParamValue("displayvalue"); // returns "+ 15 st"
 *
 * @see Xebra.LIVE_UNIT_STYLES
 */
export default function liveDisplayValueMixin<T extends new (...args: any[]) => ObjectNode>(
    objClass: T,
): T & {
    new (...args: any[]): {
        /**
         * Returns the value for the parameter specified by the given parameter type identifier.
         * @param type Parameter type identifier
         * @return Parameter value or null
         */
        getParamValue(type: string): ParamValueType;

        /**
         * Returns a list of the names of all available parameters.
         * @return Array of parameter type names
         */
        getParamTypes(): readonly string[];

        /**
         * Returns a list of the parameters that are not required for this object to be initialized.
         * @return Array of optional parameter type names
         */
        getOptionalParamTypes(): readonly string[];
    } & InstanceType<T>;
};
