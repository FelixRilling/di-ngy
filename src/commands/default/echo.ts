import { IDingyCommand } from "../IDingyCommand";
import { resolvedArgumentMap } from "cli-ngy/types/argument/resolvedArgumentMap";

const echo: IDingyCommand = {
    fn: (args: resolvedArgumentMap) => <string>args.get("val"),
    alias: [],
    args: [{
        name: "val",
        required: true
    }],
    data: {
        powerRequired: 8,
        hidden: true,
        usableInDMs: true,
        help: ""
    },
    sub: null
};

export { echo };
