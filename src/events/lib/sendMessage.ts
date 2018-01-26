import { Guild, GuildMember, Message, MessageOptions } from "discord.js";
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
} from "../../interfaces";
import { commandResult } from "../../types";
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
const send = (app: IDingy, msg: Message, content: IDingyMessageResultExpanded): Promise<void> =>
    msg.channel
        .send(content[0], <MessageOptions>{
            code: content[1],
            attachments: content[2]
        })
        .then(msgSent => {
            app.logger.debug("SentMsg");

            content[3].onSend(<Message>msgSent);
        })
        .catch(err => {
            app.logger.error(`SentMsgError ${err}`);
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
        app.logger.debug("Empty");
        send(app, msg, dataFromValue(app.strings.infoEmpty));
    } else if (content[0].length > MAX_SIZE_MESSAGE) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = Buffer.from(content[0]);

            if (content[0].length > MAX_SIZE_FILE) {
                app.logger.debug("TooLong");
                send(app, msg, dataFromValue(app.strings.infoTooLong));
            } else {
                const outputAttachment = new Attachment(
                    outputFile,
                    "output.txt"
                );

                app.logger.debug("TooLong");
                send(app, msg, [
                    app.strings.infoTooLong,
                    true,
                    [outputAttachment],
                    eventsDefault
                ]);
            }
        } else {
            app.logger.debug("TooLong false");
            send(app, msg, dataFromValue(app.strings.errorTooLong));
        }
    } else {
        // Normal case
        app.logger.debug("Sending");

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
                app.logger.debug("TextAsync");
                pipeThroughChecks(app, msg, commandResult, contentResolved);
            })
            .catch(err => {
                app.logger.error(`ErrorInPromise ${err}`);
            });
    } else {
        app.logger.debug("TextSync");
        pipeThroughChecks(
            app,
            msg,
            commandResult,
            <IDingyMessageResultExpanded>content
        );
    }
};

export default sendMessage;
