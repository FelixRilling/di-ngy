import { dingyCommandFn } from "../../types";

/* eslint no-unused-vars: "off", no-console: "off" */
/**
 * Evaluates
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {false}
 */
const commandCoreEval: dingyCommandFn = (args, msg, app): string => {
    let result = "";

    try {
        // tslint:disable-next-line
        result = eval(<string>args.code);
    } catch (err) {
        result = err;
    }

    // tslint:disable-next-line
    console.log(result);

    return String(result);
};

export default commandCoreEval;
