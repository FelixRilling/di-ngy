"use strict";

const resolveCommand = require("./lib/resolveCommand");
const sendMessage = require("./lib/sendMessage");

/**
 * onMessage event
 *
 * @param {Message} msg
 * @param {Dingy} app
 */
module.exports = (msg, app) => {
    const messageText = msg.content;

    /**
     * Basic Check
     * Conditions:
     *    NOT from the system
     *    NOT from a bot
     *    DOES start with prefix
     */
    if (!msg.system && !msg.author.bot && messageText.startsWith(app.config.prefix)) {
        const messageCommand = messageText.substr(app.config.prefix.length);
        const commandResult = resolveCommand(messageCommand, msg, app);

        app.log.debug("Resolving", msg.author.id, messageCommand, commandResult);

        //commandResult is false if the message should be ignored
        if (commandResult !== false) {
            app.log.debug("Returning", msg.author.id);
            sendMessage(app, msg, commandResult);
        } else {
            app.log.debug("Ignoring");
        }
    }
};
