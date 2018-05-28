import { Message } from "discord.js";
import { IDingy, IDingyCommandResolved } from "../../interfaces";
declare const sendMessage: (app: IDingy, msg: Message, commandResult: IDingyCommandResolved) => void;
export { sendMessage };
