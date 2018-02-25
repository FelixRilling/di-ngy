import { dingyCommandFn } from "../../types";

/* eslint no-unused-vars: "off", no-console: "off" */
/**
 * Evaluates and returns
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {false}
 */
const commandCoreDump: dingyCommandFn = (args, msg, app) => {
    let result = "";

    try {
        // tslint:disable-next-line
        result = eval(<string>args.code);
    } catch (err) {
        result = err;
    }

    // tslint:disable-next-line
    console.log(result);

    return [String(result), true];
};

export default commandCoreDump;
