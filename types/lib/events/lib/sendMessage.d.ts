import { Message } from "discord.js";
import { IDingy } from "../../../interfaces";
import { commandResult } from "../../../types";
/**
 * Performs checks and waits for promise, then sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {Array<any>|Promise} data
 */
declare const sendMessage: (app: IDingy, msg: Message, commandResult: commandResult) => void;
export default sendMessage;
