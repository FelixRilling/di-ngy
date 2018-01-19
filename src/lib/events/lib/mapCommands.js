"use strict";

const {
    objMap,
    isUndefined
} = require("lightdash");

/**
 * Maps command and inserts defaults
 *
 * @param {Object} command
 * @returns {Object}
 */
const mapCommand = (key, command) => {
    const result = command;

    result.powerRequired = !isUndefined(result.powerRequired) ? result.powerRequired : 0;
    result.hidden = !isUndefined(result.hidden) ? result.hidden : false;

    result.help = !isUndefined(result.help) ? result.help : {};
    result.help.short = !isUndefined(result.help.short) ? result.help.short : "No help provided";
    result.help.long = !isUndefined(result.help.long) ? result.help.long : result.help.short;

    if (result.sub) {
        result.sub = objMap(result.sub, mapCommand);
    }

    return result;
};

/**
 * Maps all given commands
 *
 * @param {Object} commands
 * @returns {Object}
 */
module.exports = (commands) => objMap(commands, mapCommand);
