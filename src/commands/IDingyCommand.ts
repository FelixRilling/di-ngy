import { ICommand } from "cli-ngy/types/command/ICommand";
import { commandFn } from "./commandFn";

interface IDingyCommand extends ICommand {
    fn: commandFn;
    data: {
        hidden: boolean,
        usableInDMs: boolean,
        powerRequired: number,
        help: string,
    };
}

export { IDingyCommand };
