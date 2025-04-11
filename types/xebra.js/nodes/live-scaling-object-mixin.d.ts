import { ParamValueType } from "./base";
import { ObjectNode } from "./objectNode";

/**
 * Clamp a value between a minimum and maximum
 * @param v - The value to clamp
 * @param lo - The lower bound
 * @param hi - The upper bound
 * @return The clamped value
 */
export function clamp(v: number, lo: number, hi: number): number;

/**
 * Align a value to a specific step in a range
 * @param min - The minimum value
 * @param max - The maximum value
 * @param value - The value to align
 * @param steps - The number of steps
 * @return The aligned value
 */
export function alignStep(min: number, max: number, value: number, steps: number): number;

/**
 * Certain live.* objects, for example live.slider and live.dial, manage their internal state using two separate but
 * related parameters: "distance" and "value". The "distance" parameter is always a value between 0 and 1, ignoring the
 * range and possible nonlinear scaling applied to the object. The "value" parameter is the one that the object will
 * display, and is computed by applying the exponent and range parameters to the "distance" parameter. This mixin
 * simply performs this calculation automatically whenever the "distance" parameter is set.
 *
 * @example
 * // dialNode is the ObjectNode for the live.dial
 * dialNode.setParamValue("_parameter_range", [10, 20]);
 * dialNode.setParamValue("_parameter_exponent", 1);
 * dialNode.setParamValue("distance", 0.5);
 * dialNode.getParamValue("value"); // returns 15
 *
 * dialNode.setParamValue("_parameter_exponent", 2);
 * dialNode.getParamValue("value"); // returns 12.5
 */
export default function liveScalingObjectMixin<T extends new (...args: any[]) => ObjectNode>(
    objClass: T,
): T & {
    new (...args: any[]): {
        /**
         * Sets the value for the parameter with the name type to the given value.
         * Override to handle special behavior for "distance" and "value" parameters
         * @param type - Parameter type identifier
         * @param value - Parameter value
         */
        setParamValue(type: string, value: ParamValueType): void;

        /**
         * Sequence tracker for ignored values
         */
        _ignoredValueSeq: number;
    } & InstanceType<T>;
};
