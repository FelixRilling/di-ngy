import { commandFn } from "./commandFn";
import { Command } from "cli-ngy/dist/esm/src/command/Command";
interface IDingyCommand extends Command {
    fn: commandFn;
    data: {
        hidden: boolean;
        usableInDMs: boolean;
        powerRequired: number;
        help: string;
    };
}
export { IDingyCommand };
//# sourceMappingURL=IDingyCommand.d.ts.map