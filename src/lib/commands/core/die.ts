import { commandFn } from "../../../types";

/**
 * Exits the process
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
const commandCoreDie: commandFn = (args, msg, app) => {
    app.bot.setTimeout(() => {
        // @ts-ignore
        process.exit();
    }, 1000);

    return "Shutting down.";
};

export default commandCoreDie;
