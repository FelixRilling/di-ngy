import { IDingyMessageResultExpanded } from "./interfaces";

type commandFn = (
    args: any,
    msg: any,
    app: any,
    commandLookup: any,
    attachments: any
) => commandResult;

type commandResult =
    | string
    | IDingyMessageResultExpanded
    | Promise<IDingyMessageResultExpanded>;

export { commandFn, commandResult };
