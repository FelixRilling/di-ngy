import { Collection, Message, MessageAttachment } from "discord.js";
import { IDingyCliCommands, IDingyCliLookupArgs, IDingyCliLookupSuccessful } from "./cli";
import { IDingy } from "./dingy";
import { IDingyMessageResultExpanded } from "./message";
declare type dingyCommandFn = (args: IDingyCliLookupArgs, msg: Message, app: IDingy, commandLookup: IDingyCliLookupSuccessful, attachments: Collection<string, MessageAttachment>) => dingyCommandResult;
declare type dingyCommandResult = string | IDingyMessageResultExpanded | Promise<string> | Promise<IDingyMessageResultExpanded>;
interface IDingyCommandResolved {
    success: boolean;
    result: dingyCommandResult;
    ignore?: boolean;
}
declare const mapCommands: (commands: any) => IDingyCliCommands;
declare const resolveCommand: (str: string, msg: Message, app: IDingy) => IDingyCommandResolved;
export { resolveCommand, mapCommands, dingyCommandFn, IDingyCommandResolved, dingyCommandResult };
