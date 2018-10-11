import { Message } from "discord.js";

/**
 * @private
 */
const createSlimMessage = (msg: Message): object => {
    return {
        author: { username: msg.author.username, id: msg.author.id },
        content: msg.content
    };
};

export { createSlimMessage };
