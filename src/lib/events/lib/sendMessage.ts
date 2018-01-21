import { Guild, GuildMember, Message } from "discord.js";
import {
    IDingy,
    IDingyConfigRole,
    IDingyCommand,
    IDingyCommandArg,
    IDingyLookupSuccessful,
    IDingyLookupUnsuccessful,
    IDingyCommandResolved,
    IDingyMessageResultEvents,
    IDingyMessageResultExpanded
} from "../../../interfaces";
import { commandResult } from "../../../types";
import { isPromise, isNil } from "lightdash";
import { Attachment } from "discord.js";
import { dataFromValue, eventsDefault } from "./normalizeMessage";

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
const send = (app, msg, content): void =>
    msg.channel
        .send(content[0], {
            code: content[1],
            attachments: content[2]
        })
        .then(msgSent => {
            //app.log.debug("SentMsg");

            content[3].onSend(msgSent);
        })
        .catch(err => {
            //app.log.error("SentMsgError", err);
        });

/**
 *  Checks if a message can be sent and continues
 *
 * @param {any} app
 * @param {any} msg
 * @param {any} data
 * @param {boolean} [isError=false]
 */
const pipeThroughChecks = (
    app: IDingy,
    msg: Message,
    commandResult: IDingyCommandResolved,
    content: IDingyMessageResultExpanded
) => {
    if (content[0].length === 0) {
        //app.log.notice("Empty");
        send(app, msg, dataFromValue(app.strings.infoEmpty));
    } else if (content[0].length > MAX_SIZE_MESSAGE) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = Buffer.from(content[0]);

            if (content[0].length > MAX_SIZE_FILE) {
                //app.log.notice("TooLong", true);
                send(app, msg, dataFromValue(app.strings.infoTooLong));
            } else {
                const outputAttachment = new Attachment(
                    outputFile,
                    "output.txt"
                );

                //app.log.notice("TooLong", true);
                send(app, msg, [
                    app.strings.infoTooLong,
                    true,
                    [outputAttachment],
                    eventsDefault
                ]);
            }
        } else {
            //app.log.notice("TooLong", false);
            send(app, msg, app.strings.errorTooLong);
        }
    } else {
        //Normal case
        //app.log.debug("Sending");

        if (!commandResult.success) {
            content[1] = true;
        }

        send(app, msg, content);
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
    commandResult: IDingyCommandResolved
): void => {
    const content = commandResult.result;

    if (isPromise(content)) {
        (<Promise<IDingyMessageResultExpanded>>content)
            .then(contentResolved => {
                //app.log.debug("TextAsync");
                pipeThroughChecks(app, msg, commandResult, contentResolved);
            })
            .catch(err => {
                //app.log.error("ErrorInPromise", err);
            });
    } else {
        //app.log.debug("TextSync");
        pipeThroughChecks(
            app,
            msg,
            commandResult,
            <IDingyMessageResultExpanded>content
        );
    }
};

export default sendMessage;
