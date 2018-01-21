import { Message } from "discord.js";
import { IDingy } from "../../interfaces";
/**
 * onMessage event
 *
{Message} msg
{Dingy} app
 */
declare const onMessage: (msg: Message, app: IDingy) => void;
export default onMessage;
