import { IDingyCliCommands } from "../cli";
import { commandCoreDie } from "../commands/core/die";
import { commandCoreEcho } from "../commands/core/echo";
import { commandCoreHelp } from "../commands/core/help";

const commandsDefault: IDingyCliCommands = {
    die: {
        fn: commandCoreDie,
        args: [],
        alias: ["quit", "exit"],
        powerRequired: 10,
        hidden: true,
        usableInDMs: true,
        help: {
            short: "Kills the bot",
            long: "Kills the bot"
        },
        sub: null
    },
    echo: {
        fn: commandCoreEcho,
        args: [
            {
                name: "text",
                required: true,
                help: "Text to echo"
            }
        ],
        alias: ["say"],
        powerRequired: 8,
        hidden: true,
        usableInDMs: true,
        help: {
            short: "Echos text",
            long: "Echos text"
        },
        sub: null
    },
    help: {
        fn: commandCoreHelp,
        args: [
            {
                name: "command",
                required: false,
                default: null,
                help: "Command to get help for"
            }
        ],
        alias: ["commands"],
        powerRequired: 0,
        hidden: false,
        usableInDMs: true,
        help: {
            short: "Shows help",
            long: "Shows help for one or all commands"
        },
        sub: null
    }
};

export { commandsDefault };
