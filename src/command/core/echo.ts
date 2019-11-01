import { DingyCommand } from "../DingyCommand";
import { ResolvedArgumentMap } from "cli-ngy/dist/esm/src/argument/ResolvedArgumentMap";

/**
 * Built-in "echo" command.
 *
 * @private
 */
const echo: DingyCommand = {
    alias: ["say", "send"],
    args: [
        {
            name: "val",
            required: true
        }
    ],
    sub: null,
    data: {
        powerRequired: 8,
        hidden: true,
        usableInDMs: true,
        help: "Echoes a text."
    },
    fn: (args: ResolvedArgumentMap) => args.get("val")!
};

export { echo };
