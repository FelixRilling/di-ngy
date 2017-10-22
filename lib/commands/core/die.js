"use strict";

/**
 * Exits the process
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
module.exports = function (args, msg, app) {
    app.bot.setTimeout(() => {
        // eslint-disable-next-line
        process.exit();
    }, 1000);

    return "Shutting down.";
};
