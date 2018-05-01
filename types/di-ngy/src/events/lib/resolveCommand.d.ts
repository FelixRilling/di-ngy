import { Message } from "discord.js";
import { IDingy, IDingyCommandResolved } from "../../interfaces";
declare const resolveCommand: (str: string, msg: Message, app: IDingy) => IDingyCommandResolved;
export default resolveCommand;
