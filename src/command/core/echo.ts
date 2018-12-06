import { resolvedArgumentMap } from "cli-ngy/types/argument/resolvedArgumentMap";
import { IDingyCommand } from "../IDingyCommand";

/**
 * Built-in "echo" command.
 *
 * @private
 */
const echo: IDingyCommand = {
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
    fn: (args: resolvedArgumentMap) => args.get("val")!
};

export { echo };
