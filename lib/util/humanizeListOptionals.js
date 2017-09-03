"use strict";

/**
 * Turns an array into a humanized string of optionals
 *
 * @param {Array<string>} arr
 * @returns {string}
 */
module.exports = function (arr) {
    return arr.map((item, index, data) => {
        if (index === 0) {
            return `'${item}'`;
        } else if (index < data.length - 1) {
            return `, '${item}'`;
        } else {
            return ` or '${item}'`;
        }
    }).join("");
};
