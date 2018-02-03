import { dingyCommandFn } from "../../types";

/**
 * Exits the process
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
const commandCoreDie: dingyCommandFn = (args, msg, app) => {
    app.bot.setTimeout(() => {
        process.exit();
    }, 1000);

    return "Shutting down.";
};

export default commandCoreDie;
