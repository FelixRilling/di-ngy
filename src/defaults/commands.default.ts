import { IDingyCliCommands } from "../cli";
import { commandCoreDie } from "../commands/core/die";
import { commandCoreDump } from "../commands/core/dump";
import { commandCoreEcho } from "../commands/core/echo";
import { commandCoreEval } from "../commands/core/eval";
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
    eval: {
        fn: commandCoreEval,
        args: [
            {
                name: "code",
                required: true,
                help: "Code to run "
            }
        ],
        alias: [],
        powerRequired: 10,
        hidden: true,
        usableInDMs: true,
        help: {
            short: "Executes JS code",
            long: "Executes JS code, dangerous!"
        },
        sub: null
    },
    dump: {
        fn: commandCoreDump,
        args: [
            {
                name: "code",
                required: true,
                help: "Code to run "
            }
        ],
        alias: [],
        powerRequired: 10,
        hidden: true,
        usableInDMs: true,
        help: {
            short: "Executes JS code and returns",
            long: "Executes JS code and returns, dangerous!"
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
