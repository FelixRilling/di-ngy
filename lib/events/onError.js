"use strict";

const RECONNECT_TIMEOUT = 10000;

/**
 * onError event
 *
 * @param {Error} err
 * @param {Dingy} app
 */
module.exports = function (err, app) {
    app.log.error("Reconnect", `Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`);
    app.bot.setTimeout(() => {
        app.connect();
    }, RECONNECT_TIMEOUT);
};
