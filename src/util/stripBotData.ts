"use strict";

import decycle from "./decycle";
import {
    isObject,
    isNil,
    isString,
    isArray,
    isNumber,
    isBoolean,
    isFunction,
    objEntries
} from "lightdash";

const BLOCKED_KEYS = /_\w+|\$\w+|client|guild|lastMessage/;

/**
 * Checks if a value is to be kept in a filter iterator
 *
 * @param {any} value
 * @returns {boolean}
 */
const isLegalValue = (value: any): boolean =>
    !isNil(value) && !isFunction(value);

/**
 * Checks if a entry is to be kept in a filter iterator
 *
 * @param {Array<any>} entry
 * @returns {boolean}
 */
const isLegalEntry = (entry: [string, any]): boolean =>
    !BLOCKED_KEYS.test(entry[0]) && isLegalValue(entry[1]);

/**
 * Cycles and strips all illegal values
 *
 * @param {any} val
 * @returns {any}
 */
const strip = (val: any): any => {
    if (isString(val) || isNumber(val) || isBoolean(val)) {
        return val;
    } else if (isArray(val)) {
        return val.filter(isLegalValue).map(strip);
    } else if (isObject(val)) {
        const result = {};

        objEntries(val)
            .filter(isLegalEntry)
            .forEach(entry => {
                result[entry[0]] = strip(entry[1]);
            });

        return result;
    } else {
        return null;
    }
};

/**
 * Strips sensitive data from bot output
 *
 * @param {Object} obj
 * @returns {any}
 */
const stripBotData = (obj: any): any => strip(decycle(obj));

export default stripBotData;
