import { IDingyCommand } from "../IDingyCommand";
import { resolvedArgumentMap } from "cli-ngy/types/argument/resolvedArgumentMap";

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
