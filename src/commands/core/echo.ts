import { dingyCommandFn } from "../../types";

/**
 * Echos text
 *
 * @param {Array<any>} args
 * @returns {string}
 */
const commandCoreEcho: dingyCommandFn = args => <string>args.text;

export default commandCoreEcho;
