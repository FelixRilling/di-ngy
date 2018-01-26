import core_help from "../commands/core/help";
import core_eval from "../commands/core/eval";
import core_echo from "../commands/core/echo";
import core_die from "../commands/core/die";
import { IDingyCommands, IDingyCommandArgs } from "../interfaces";

const commandsDefault: IDingyCommands = {
    die: {
        fn: core_die,
        args: [],
        alias: ["quit", "exit"],
        powerRequired: 10,
        hidden: true,
        help: {
            short: "Kills the bot",
            long: "Kills the bot"
        },
        sub: null
    },
    eval: {
        fn: core_eval,
        args: [
            {
                name: "code",
                required: true,
                help: "Code to run "
            }
        ],
        alias: ["dump"],
        powerRequired: 10,
        hidden: true,
        help: {
            short: "Executes JS code",
            long: "Executes JS code, dangerous!"
        },
        sub: null
    },
    echo: {
        fn: core_echo,
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
        help: {
            short: "Echos text",
            long: "Echos text"
        },
        sub: null
    },
    help: {
        fn: core_help,
        args: [
            {
                name: "command",
                required: false,
                default: null,
                help: "Command to get help for"
            }
        ],
        alias: ["commands"],
        hidden: false,
        powerRequired: 0,
        help: {
            short: "Shows help",
            long: "Shows help for one or all commands"
        },
        sub: null
    }
};

export default commandsDefault;
