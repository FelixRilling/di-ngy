"use strict";

/**
 * Turns an array into a humanized string
 *
 * @param {Array<string>} arr
 * @returns {string}
 */
module.exports = arr => arr.map(key => `'${key}'`).join(", ");
