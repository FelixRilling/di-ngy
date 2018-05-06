import { Message } from "discord.js";
import { IDingy } from "../interfaces";

import resolveCommand from "./lib/resolveCommand";
import sendMessage from "./lib/sendMessage";

const onMessage = (msg: Message, app: IDingy): void => {
    const messageText = msg.content;

    /**
     * Basic Check
     * Conditions:
     *    NOT from a bot
     *    DOES start with prefix
     *      NOT just the prefix
     */
    if (
        !msg.author.bot &&
        messageText.startsWith(app.config.prefix) &&
        messageText !== app.config.prefix
    ) {
        const messageCommand = messageText.substr(app.config.prefix.length);
        const commandResult = resolveCommand(messageCommand, msg, app);

        app.logger.info(`Resolving ${msg.author.id}: ${msg.content}`);

        if (commandResult.ignore) {
            app.logger.debug("Ignoring");
        } else {
            sendMessage(app, msg, commandResult);
            app.logger.info(
                `Returning response to message from ${msg.author.id}`
            );
        }
    }
};

export default onMessage;
