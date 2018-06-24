import { Message, User } from "discord.js";
import { resolveCommand } from "../command";
import { IDingy } from "../dingy";
import { sendMessage } from "../message";
import { toFullName } from "../util/toFullName";

const stringifyAuthor = (author: User): string =>
    `${author.id}[${toFullName(author)}]`;

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

        app.logger.info(
            `Resolving message from ${stringifyAuthor(
                msg.author
            )}: ${JSON.stringify(msg.content)}`
        );

        if (commandResult.ignore) {
            app.logger.debug("Ignoring");
        } else {
            sendMessage(app, msg, commandResult);
            app.logger.info(
                `Returning response to ${stringifyAuthor(msg.author)}`
            );
        }
    }
};

export { onMessage };
