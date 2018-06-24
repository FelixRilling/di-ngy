import { Message } from "discord.js";
import { IDingy, IDingyCliCommands, IDingyCommandResolved } from "../../interfaces";
declare const mapCommands: (commands: any) => IDingyCliCommands;
declare const resolveCommand: (str: string, msg: Message, app: IDingy) => IDingyCommandResolved;
export { resolveCommand, mapCommands };
