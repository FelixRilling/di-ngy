import { Guild, GuildMember, Message } from "discord.js";
import {
    IDingy,
    IDingyConfigRole,
    IDingyMessageResultExpanded,
    IDingyMessageResultEvents
} from "../../../interfaces";
import { commandResult } from "../../../types";
import { isString, isPromise, isNil, objDefaultsDeep } from "lightdash";

const MAX_SIZE_MESSAGE = 2000;
const MAX_SIZE_FILE = 8000000;

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
    msg.channel
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
const sendError = (app, msg, text, files = []) =>
    send(app, msg, text, true, files, eventsDefault);

/**
 *  Checks if a message can be sent and continues
 *
 * @param {any} app
 * @param {any} msg
 * @param {any} data
 * @param {boolean} [isError=false]
 */
const pipeThroughChecks = (app, msg, data, isError = false) => {
    const { text, code, files, events } = mapData(data);

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
const sendMessage = (
    app: IDingy,
    msg: Message,
    commandResult: commandResult
) => {
    const content = commandResult.result;

    if (isNil(content)) {
        app.log.error("ErrorInContent", {
            content
        });
    } else if (isPromise(content)) {
        content
            .then(contentResolved => {
                app.log.debug("TextAsync");
                pipeThroughChecks(
                    app,
                    msg,
                    contentResolved,
                    !commandResult.success
                );
            })
            .catch(err => {
                app.log.error("ErrorInPromise", err);
            });
    } else {
        app.log.debug("TextSync");
        pipeThroughChecks(app, msg, content, !commandResult.success);
    }
};

export default sendMessage;
