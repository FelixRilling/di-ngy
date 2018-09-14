import { dingyCommandFn } from "../../command";

/**
 * Echos text
 *
 * @private
 * @param {Array<any>} args
 * @returns {string}
 */
const commandCoreEcho: dingyCommandFn = args => <string>args.text;

export { commandCoreEcho };
