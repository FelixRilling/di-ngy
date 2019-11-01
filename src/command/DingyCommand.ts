import { CommandFn } from "./CommandFn";
import { Command } from "cli-ngy/dist/esm/src/command/Command";

interface DingyCommand extends Command {
    fn: CommandFn;
    data: {
        hidden: boolean;
        usableInDMs: boolean;
        powerRequired: number;
        help: string;
    };
}

export { DingyCommand };
