import { Message, MessageAttachment, Collection } from "discord.js";
import {
    IDingy,
    IDingyMessageResultExpanded,
    IDingyCommand,
    IDingyCommandArgs,
    IDingyLookupSuccessful
} from "./interfaces";

type commandMap = Map<string, IDingyCommand>;

type commandFn = (
    args: IDingyCommandArgs,
    msg: Message,
    app: IDingy,
    commandLookup: IDingyLookupSuccessful,
    attachments: Collection<string, MessageAttachment>
) => commandResult;

type commandResult =
    | string
    | IDingyMessageResultExpanded
    | Promise<string>
    | Promise<IDingyMessageResultExpanded>;

export { commandMap, commandFn, commandResult };
