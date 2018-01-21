import { Message } from "discord.js";
import { IDingy } from "../../../interfaces";
declare const resolveCommand: (str: string, msg: Message, app: IDingy) => any;
export default resolveCommand;
