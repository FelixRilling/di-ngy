import { Message } from "discord.js";
import { IDingy } from "../../interfaces";

import resolveCommand from "./lib/resolveCommand";
import sendMessage from "./lib/sendMessage";

const onMessage = (msg: Message, app: IDingy): void => {
    const messageText = msg.content;

    /**
     * Basic Check
     * Conditions:
     *    NOT from the system
     *    NOT from a bot
     *    DOES start with prefix
     */
    if (
        !msg.system &&
        !msg.author.bot &&
        messageText.startsWith(app.config.prefix)
    ) {
        const messageCommand = messageText.substr(app.config.prefix.length);
        const commandResult = resolveCommand(messageCommand, msg, app);

        //app.log.debug("Resolving", msg.author.id, messageCommand, commandResult);

        if (commandResult.ignore) {
            //app.log.debug("Ignoring");
        } else {
            sendMessage(app, msg, commandResult);
            //app.log.debug("Returning", msg.author.id);
        }
    }
};

export default onMessage;
