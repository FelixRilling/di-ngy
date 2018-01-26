import { commandFn } from "../../types";

/**
 * Echos text
 *
 * @param {Array<any>} args
 * @returns {string}
 */
const commandCoreEcho: commandFn = args => <string>args.text;

export default commandCoreEcho;
