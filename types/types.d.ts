import { Message, MessageAttachment, Collection } from "discord.js";
import { IDingy, IDingyMessageResultExpanded, IDingyCliCommand, IDingyCliLookupArgs, IDingyCliLookupSuccessful } from "./interfaces";
declare type dingyCliCommandEntry = [string, IDingyCliCommand];
declare type dingyCliCommandEntries = dingyCliCommandEntry[];
declare type dingyCliCommandMap = Map<string, IDingyCliCommand>;
declare type dingyCommandFn = (args: IDingyCliLookupArgs, msg: Message, app: IDingy, commandLookup: IDingyCliLookupSuccessful, attachments: Collection<string, MessageAttachment>) => dingyCommandResult;
declare type dingyCommandResult = string | IDingyMessageResultExpanded | Promise<string> | Promise<IDingyMessageResultExpanded>;
export { dingyCliCommandEntry, dingyCliCommandEntries, dingyCliCommandMap, dingyCommandFn, dingyCommandResult };
