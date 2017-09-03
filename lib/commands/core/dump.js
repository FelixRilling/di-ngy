"use strict";

/* eslint no-unused-vars: "off" */
/**
 * Evaluates and dumps
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
module.exports = function (args, msg, app) {
    let result = "";

    try {
        result = eval(args.code);
    } catch (err) {
        result = err;
    }

    return [String(result), "js"];
};
