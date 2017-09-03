"use strict";

const {
    isObject,
    isNil,
    isString,
    isArray,
    isNumber,
    isBoolean,
    isFunction
} = require("lodash");
const {
    decycle
} = require("./cycle");

const BLOCKED_KEYS = /\$\w+|_\w+|client|guild|lastMessage/;

/**
 * Checks if a value is to be kept in a filter iterator
 *
 * @param {any} value
 * @returns {boolean}
 */
const isLegalValue = value => !isNil(value) && !isFunction(value);

/**
 * Checks if a entry is to be kept in a filter iterator
 *
 * @param {Array<any>} entry
 * @returns {boolean}
 */
const isLegalEntry = entry => !BLOCKED_KEYS.test(entry[0]) && isLegalValue(entry[1]);


/**
 * Cycles and strips all illegal values
 *
 * @param {any} val
 * @returns {any}
 */
const strip = function (val) {
    if (isString(val) || isNumber(val) || isBoolean(val)) {
        return val;
    } else if (isArray(val)) {
        return val.filter(isLegalValue);
    } else if (isObject(val)) {
        const result = {};

        Object.entries(val)
            .filter(isLegalEntry)
            .forEach(entry => {
                result[entry[0]] = entry[1];
            });

        return result;
    } else {
        return null;
    }
};

/**
 * Clones array and strips illegals
 *
 * @param {any} obj
 * @returns {any}
 */
module.exports = function (obj) {
    const result = Object.assign({}, obj);

    return strip(decycle(result));
};
