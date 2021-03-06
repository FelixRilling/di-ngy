import {
    isBoolean,
    isFunction,
    isNil,
    isNumber,
    isObject,
    isString,
    objDecycle
} from "lightdash";

const BLOCKED_KEYS = /_\w+|\$\w+|client|guild|lastMessage|token/;

/**
 * Checks if a value is to be kept in a filter iterator
 *
 * @private
 * @param {any} value
 * @returns {boolean}
 */
const isLegalValue = (value: any): boolean =>
    !isNil(value) && !isFunction(value);

/**
 * Checks if a entry is to be kept in a filter iterator
 *
 * @private
 * @param {Array<any>} entry
 * @returns {boolean}
 */
const isLegalEntry = (entry: [string, any]): boolean =>
    !BLOCKED_KEYS.test(entry[0]) && isLegalValue(entry[1]);

/**
 * Recursively strips sensitive data.
 *
 * @private
 * @param {any} val
 * @returns {any}
 */
const strip = (val: any): any => {
    if (isString(val) || isNumber(val) || isBoolean(val)) {
        return val;
    } else if (Array.isArray(val)) {
        return val.filter(isLegalValue).map(strip);
    } else if (isObject(val)) {
        const result: { [key: string]: any } = {};

        Object.entries(val)
            .filter(isLegalEntry)
            .forEach(entry => {
                result[entry[0]] = strip(entry[1]);
            });

        return result;
    }

    return null;
};

/**
 * Decycles and recursively strips sensitive data.
 *
 * @private
 * @param {any} val
 * @returns {any}
 */
const stripBotData = (val: any): any => strip(objDecycle(val));

export { stripBotData };
