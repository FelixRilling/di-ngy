import { Message } from "discord.js";
import { IDingy, IDingyCommandResolved } from "../../interfaces";
/**
 * Performs checks and waits for promise, then sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {Array<any>|Promise} data
 */
declare const sendMessage: (app: IDingy, msg: Message, commandResult: IDingyCommandResolved) => void;
export default sendMessage;
