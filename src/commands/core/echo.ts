import { dingyCommandFn } from "../../types";

/**
 * Echos text
 *
 * @private
 * @param {Array<any>} args
 * @returns {string}
 */
const commandCoreEcho: dingyCommandFn = args => <string>args.text;

export default commandCoreEcho;
