"use strict";

const MAX_SIZE_MESSAGE = 2000;
const MAX_SIZE_FILE = 8000000;

const _isString = require("lodash/isString");
const _isFunction = require("lodash/isFunction");

/**
 * Sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {string} text
 * @param {boolean|string} code
 * @param {Array<any>} files
 */
const send = function (app, msg, text, code, files) {
    msg
        .channel
        .send(String(text), {
            code,
            files
        })
        .catch(err => app.log.error("SentMsgError", err))
        .then(() => app.log.debug("SentMsg"));
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
const performChecks = function (app, msg, text, code, files) {
    if (text.length === 0) {
        app.log.notice("Empty");
        send(app, msg, app.strings.infoEmpty, "error", []);
    } else if (text.length > MAX_SIZE_MESSAGE) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = Buffer.from(text);

            if (text.length > MAX_SIZE_FILE) {
                app.log.notice("TooLong", true);
                send(app, msg, app.strings.infoTooLong, "error", []);
            } else {
                const outputAttachment = {
                    name: "output.txt",
                    attachment: outputFile
                };

                app.log.notice("TooLong", true);
                send(app, msg, app.strings.infoTooLong, "error", [outputAttachment]);
            }
        } else {
            app.log.notice("TooLong", false);
            send(app, msg, app.strings.errorTooLong, "error", []);
        }
    } else {
        //Normal case
        app.log.debug("Sending");
        send(app, msg, text, code, files);
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
    const isString = _isString(data[0]);
    const isPromise = _isFunction(data[0].then);
    const code = data[1] || false;
    const files = data[2] || [];

    if (isPromise) {
        data[0]
            .catch(err => {
                app.log.error("ErrorInPromise", err);
            })
            .then(resolvedText => {
                app.log.debug("TextAsync");
                performChecks(app, msg, resolvedText, code, files);
            });
    } else if (isString) {
        app.log.debug("TextSync");
        performChecks(app, msg, data[0], code, files);
    } else {
        app.log.warning("StrangeType", data[0], typeof data[0]);
    }
};
