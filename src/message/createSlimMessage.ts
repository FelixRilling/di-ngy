import { Message } from "discord.js";

/**
 * Helper function which creates a slim, printable version of a message.
 *
 * @private
 */
const createSlimMessage = (msg: Message): object => {
    return {
        author: { username: msg.author.username, id: msg.author.id },
        content: msg.content
    };
};

export { createSlimMessage };
