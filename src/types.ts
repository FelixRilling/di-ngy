import { Message } from "discord.js";
import {
    IDingy,
    IDingyMessageResultExpanded,
    IDingyCommandArgs
} from "./interfaces";

type commandFn = (
    args: IDingyCommandArgs,
    msg: Message,
    app: IDingy,
    commandLookup: any,
    attachments: any
) => commandResult;

type commandResult =
    | string
    | IDingyMessageResultExpanded
    | Promise<string>
    | Promise<IDingyMessageResultExpanded>;

export { commandFn, commandResult };
