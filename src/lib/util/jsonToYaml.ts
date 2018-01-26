"use strict";

import decycle from "./decycle";
import {
    objEntries,
    objKeys,
    isObject,
    isArray,
    isFunction,
    isString,
    isNumber,
    isBoolean
} from "lightdash";

const LINEBREAK = "\n";
const INDENT_CHAR = " ";
const INDENT_SIZE = 2;

/**
 * Indent string by factor
 *
 * @param {string} str
 * @param {number} factor
 * @returns {string}
 */
const indent = (str: string, factor: number): string => INDENT_CHAR.repeat(factor * INDENT_SIZE) + str;


/**
 * Formats JSON as YAML
 *
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
        return LINEBREAK + val
            .filter(item => !isFunction(item))
            .map(item => indent(format(item, factor + 1), factor))
            .join(LINEBREAK);
    } else if (isObject(val) && objKeys(val).length > 0) {
        return LINEBREAK + objEntries(val)
            .filter(entry => !isFunction(entry[1]))
            .map(entry => indent(`${entry[0]}: ${format(entry[1], factor + 1)}`, factor))
            .join(LINEBREAK);
    } else {
        return "";
    }
};

/**
 * Decycles and trims object after formating
 *
 * @param {Object} obj
 * @returns {string}
 */
const jsonToYaml = (obj: any): string => format(decycle(obj)).replace(/\s+\n/g, "\n").trim();

export default jsonToYaml;
