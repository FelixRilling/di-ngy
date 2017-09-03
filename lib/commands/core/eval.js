"use strict";

/* eslint no-unused-vars: "off", no-console: "off" */
/**
 * Evaluates
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {false}
 */
module.exports = function (args, msg, app) {
    let result = "";

    try {
        result = eval(args.code);
    } catch (err) {
        result = err;
    }

    console.log(result);

    return false;
};
