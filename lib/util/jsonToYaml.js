"use strict";

const {
    decycle
} = require("./cycle");
const {
    isObject,
    isArray,
    isFunction,
    isString,
    isNumber,
    isBoolean,
    isNil,
    isEmpty
} = require("lodash");

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
const indent = (str, factor) => INDENT_CHAR.repeat(factor * INDENT_SIZE) + str;


/**
 * Formats JSON as YAML
 *
 * @param {any} val
 * @param {number} [factor=0]
 * @returns {string}
 */
const format = function (val, factor = 0) {
    if (isNil(val) || isEmpty(val)) {
        return "";
    } else if (isString(val)) {
        return val;
    } else if (isNumber(val) || isBoolean(val)) {
        return String(val);
    } else if (isArray(val)) {
        return LINEBREAK + val
            .filter(item => !isFunction(item))
            .map(item => indent(format(item, factor + 1), factor))
            .join(LINEBREAK);
    } else if (isObject(val)) {
        return LINEBREAK + Object.entries(val)
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
 * @param {any} obj
 * @returns {string}
 */
module.exports = function (obj) {
    return format(decycle(obj)).replace(/\s+\n/g, "\n").trim();
};
