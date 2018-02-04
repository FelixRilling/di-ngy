import { Message, MessageAttachment, Collection } from "discord.js";
import {
    IDingy,
    IDingyMessageResultExpanded,
    IDingyCliCommand,
    IDingyCliLookupArgs,
    IDingyCliLookupSuccessful
} from "./interfaces";

type dingyCliCommandEntry = [string, IDingyCliCommand];

type dingyCliCommandEntries = dingyCliCommandEntry[];

type dingyCliCommandMap = Map<string, IDingyCliCommand>;

type dingyCommandFn = (
    args: IDingyCliLookupArgs,
    msg: Message,
    app: IDingy,
    commandLookup: IDingyCliLookupSuccessful,
    attachments: Collection<string, MessageAttachment>
) => dingyCommandResult;

type dingyCommandResult =
    | string
    | IDingyMessageResultExpanded
    | Promise<string>
    | Promise<IDingyMessageResultExpanded>;

export {
    dingyCliCommandEntry,
    dingyCliCommandEntries,
    dingyCliCommandMap,
    dingyCommandFn,
    dingyCommandResult
};
