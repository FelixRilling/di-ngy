import { commandFn } from "../../types";

/* eslint no-unused-vars: "off", no-console: "off" */
/**
 * Evaluates
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {false}
 */
const commandCoreEval: commandFn = (args, msg, app): string => {
    let result = "";

    try {
        result = eval(<string>args.code);
    } catch (err) {
        result = err;
    }

    console.log(result);

    return String(result);
};

export default commandCoreEval;
