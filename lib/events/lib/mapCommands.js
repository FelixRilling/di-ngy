"use strict";

const {
    mapValues,
    isUndefined
} = require("lodash");

const mapCommand = function (command) {
    const result = command;

    result.powerRequired = !isUndefined(result.powerRequired) ? result.powerRequired : 0;
    result.hidden = !isUndefined(result.hidden) ? result.hidden : false;

    result.help = !isUndefined(result.help) ? result.help : {};
    result.help.short = !isUndefined(result.help.short) ? result.help.short : "No help provided";
    result.help.long = !isUndefined(result.help.long) ? result.help.long : result.help.short;

    if (result.sub) {
        result.sub = mapValues(result.sub, mapCommand);
    }

    return result;
};

module.exports = function (commands) {
    return mapValues(commands, mapCommand);
};
