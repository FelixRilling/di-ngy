"use strict";

import {
    isArray,
    isBoolean,
    isFunction,
    isNumber,
    isObject,
    isString
} from "lightdash";
import decycle from "./decycle";

const LINEBREAK = "\n";
const INDENT_CHAR = " ";
const INDENT_SIZE = 2;

/**
 * Indent string by factor
 *
 * @private
 * @param {string} str
 * @param {number} factor
 * @returns {string}
 */
const indent = (str: string, factor: number): string =>
    INDENT_CHAR.repeat(factor * INDENT_SIZE) + str;

/**
 * Formats JSON as YAML
 *
 * Note: the output is not fully spec compliant, strings are not escaped/quoted
 *
 * @private
 * @param {any} val
 * @param {number} [factor=0]
 * @returns {string}
 */
const format = (val: any, factor: number = 0): string => {
    if (isString(val) && val.length > 0) {
        return val;
    } else if (isNumber(val) || isBoolean(val)) {
        return String(val);
    } else if (isArray(val) && val.length > 0) {
        return (
            LINEBREAK +
            val
                .filter(item => !isFunction(item))
                .map(item => indent(format(item, factor + 1), factor))
                .join(LINEBREAK)
        );
    } else if (isObject(val) && Object.keys(val).length > 0) {
        return (
            LINEBREAK +
            Object.entries(val)
                .filter(entry => !isFunction(entry[1]))
                .map(entry =>
                    indent(
                        `${entry[0]}: ${format(entry[1], factor + 1)}`,
                        factor
                    )
                )
                .join(LINEBREAK)
        );
    }

    return "";
};

/**
 * Decycles and trims object after formating
 *
 * @private
 * @param {Object} obj
 * @returns {string}
 */
const jsonToYaml = (obj: any): string =>
    format(decycle(obj))
        .replace(/\s+\n/g, "\n")
        .trim();

export default jsonToYaml;
