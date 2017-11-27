"use strict";

const MAX_SIZE_MESSAGE = 2000;
const MAX_SIZE_FILE = 8000000;

const {
    isString,
    isPromise,
    isNil,
    objDefaultsDeep
} = require("lightdash");

const eventsDefault = {
    onSend: () => {}
};

const dataDefaults = ["", false, [], eventsDefault];

/**
 * Runs data through defaults and transforms
 *
 * @param {any} data
 * @returns {Object}
 */
const mapData = (data) => {
    let dataObj = data;

    if (isString(dataObj)) {
        dataObj = [dataObj];
    }

    dataObj = objDefaultsDeep(dataObj, dataDefaults);

    return {
        text: dataObj[0],
        code: dataObj[1],
        files: dataObj[2],
        events: dataObj[3]
    };
};

/**
 * Sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {string} text
 * @param {boolean|string} code
 * @param {Array<any>} files
 */
const send = (app, msg, text, code, files, events) => {
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
 * Error sending shorthand
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {string} text
 * @param {any} [files=[]]
 */
const sendError = (app, msg, text, files = []) => send(app, msg, text, true, files, eventsDefault);

/**
 *  Checks if a message can be sent and continues
 *
 * @param {any} app
 * @param {any} msg
 * @param {any} data
 * @param {boolean} [isError=false]
 */
const pipeThroughChecks = (app, msg, data, isError = false) => {
    const {
        text,
        code,
        files,
        events,
    } = mapData(data);

    if (text.length === 0) {
        app.log.notice("Empty");
        sendError(app, msg, app.strings.infoEmpty);
    } else if (text.length > MAX_SIZE_MESSAGE) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = Buffer.from(text);

            if (text.length > MAX_SIZE_FILE) {
                app.log.notice("TooLong", true);
                sendError(app, msg, app.strings.infoTooLong);
            } else {
                const outputAttachment = {
                    name: "output.txt",
                    attachment: outputFile
                };

                app.log.notice("TooLong", true);
                sendError(app, msg, app.strings.infoTooLong, outputAttachment);
            }
        } else {
            app.log.notice("TooLong", false);
            sendError(app, msg, app.strings.errorTooLong);
        }
    } else {
        //Normal case
        app.log.debug("Sending");

        if (isError) {
            sendError(app, msg, text);
        } else {
            send(app, msg, text, code, files, events);
        }
    }
};

/**
 * Performs checks and waits for promise, then sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {Array<any>|Promise} data
 */
module.exports = (app, msg, data) => {
    const content = data.result;

    if (isNil(content)) {
        app.log.error("ErrorInContent", {
            content
        });
    } else if (isPromise(content)) {
        content
            .then(contentResolved => {
                app.log.debug("TextAsync");
                pipeThroughChecks(app, msg, contentResolved, !data.success);
            })
            .catch(err => {
                app.log.error("ErrorInPromise", err);
            });
    } else {
        app.log.debug("TextSync");
        pipeThroughChecks(app, msg, content, !data.success);
    }
};
