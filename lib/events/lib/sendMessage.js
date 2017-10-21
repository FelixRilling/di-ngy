"use strict";

const MAX_SIZE_MESSAGE = 2000;
const MAX_SIZE_FILE = 8000000;

const {
    isString,
    isFunction,
    isUndefined,
    defaults
} = require("lodash");

const eventsDefault = {
    onSend: () => {}
};

/**
 * Checks if a value is a promise
 *
 * @param {any} val
 * @returns {boolean}
 */
const isPromise = val => isFunction(val.then) && isFunction(val.catch);

/**
 * Sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {string} text
 * @param {boolean|string} code
 * @param {Array<any>} files
 */
const send = function (app, msg, text, code, files, events) {
    msg
        .channel
        .send(text, {
            code,
            files
        })
        .then(msgSent => {
            app.log.debug("SentMsg");

            events.onSend(msgSent);
        })
        .catch(err => app.log.error("SentMsgError", err));
};

/**
 * Checks if a message can be sent and continues
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {string} text
 * @param {boolean|string} code
 * @param {Array<any>} files
 */
const pipeThroughChecks = function (app, msg, text, code, files, events) {
    if (text.length === 0) {
        app.log.notice("Empty");
        send(app, msg, app.strings.infoEmpty, "error", [], eventsDefault);
    } else if (text.length > MAX_SIZE_MESSAGE) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = Buffer.from(text);

            if (text.length > MAX_SIZE_FILE) {
                app.log.notice("TooLong", true);
                send(app, msg, app.strings.infoTooLong, "error", [], eventsDefault);
            } else {
                const outputAttachment = {
                    name: "output.txt",
                    attachment: outputFile
                };

                app.log.notice("TooLong", true);
                send(app, msg, app.strings.infoTooLong, "error", [outputAttachment], eventsDefault);
            }
        } else {
            app.log.notice("TooLong", false);
            send(app, msg, app.strings.errorTooLong, "error", [], eventsDefault);
        }
    } else {
        //Normal case
        app.log.debug("Sending");
        send(app, msg, text, code, files, events);
    }
};

/**
 * Performs checks and waits for promise, then sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {Array<any>} data
 */
module.exports = function (app, msg, data) {
    const text = data[0];
    const code = isUndefined(data[1]) ? false : data[1];
    const files = isUndefined(data[2]) ? [] : data[2];
    const events = defaults(data[3], eventsDefault);

    if (isPromise(data[0])) {
        text
            .then(resolvedText => {
                app.log.debug("TextAsync");
                pipeThroughChecks(app, msg, resolvedText, code, files, events);
            })
            .catch(err => {
                app.log.error("ErrorInPromise", err);
            });
    } else if (isString(data[0])) {
        app.log.debug("TextSync");
        pipeThroughChecks(app, msg, text, code, files, events);
    } else {
        app.log.warning("StrangeType", text, typeof text);
        pipeThroughChecks(app, msg, String(data[0]), code, files, events);
    }
};
