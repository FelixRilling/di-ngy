/**
 * Helper function which creates a slim, printable version of a message.
 *
 * @private
 */
const createSlimMessage = (msg) => {
    return {
        author: { username: msg.author.username, id: msg.author.id },
        content: msg.content
    };
};
export { createSlimMessage };
//# sourceMappingURL=createSlimMessage.js.map