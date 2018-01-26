import { commandFn } from "../../types";
import { IDingyMessageResultExpanded, IDingy, IDingyCommand, IDingyCommands } from "../../interfaces";
import { arrFrom } from "lightdash";

/**
 * Displays list of all non-hidden commands
 *
 * @param {Object} commands
 * @param {Dingy} app
 * @returns {string}
 */
const getHelpAll = (commandsMap: Map<string, IDingyCommand>, app: IDingy): IDingyMessageResultExpanded => {
    const result = {};

    commandsMap.forEach((command, commandName) => {
        const subcommandsList = command.sub !== null ? app.util.humanizeList(

            arrFrom(command.sub.map.keys())
        ) : null;

        if (!command.hidden) {
            if (command.sub) {
                result[commandName] = {
                    desc: command.help.short,
                    subcommands: subcommandsList
                };
            } else {
                result[commandName] = command.help.short;
            }
        }
    });

    return [
        ["Help", app.strings.separator, app.util.jsonToYaml(result)].join("\n"),
        "yaml"
    ];
};

/**
 * Displays help for a single command
 *
 * @param {Object} command
 * @param {Array<string>} commandPath
 * @param {Dingy} app
 * @returns {string}
 */
const getHelpSingle = (command: IDingyCommand, commandPath: string[], app: IDingy): IDingyMessageResultExpanded => {
    const result = {
        desc: command.help.long,
        alias: null,
        args: null,
        sub: null
    };

    if (command.alias.length > 0) {
        result.alias = app.util.humanizeList(command.alias);
    }

    if (command.sub !== null) {
        result.sub = arrFrom(
            command.sub.getAll().map.keys()
        )
    }

    if (command.args.length > 0) {
        result.args = {};

        command.args.forEach(arg => {
            result.args[arg.name] = {};

            if (arg.help) {
                result.args[arg.name].desc = arg.help;
            }

            if (arg.required) {
                result.args[arg.name].required = arg.required;
            }
        });
    }

    return [
        [
            `Help for '${commandPath.join(" ")}'`,
            app.strings.separator,
            app.util.jsonToYaml(result)
        ].join("\n"),
        "yaml"
    ];
};

/**
 * Displays help
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
const commandCoreHelp: commandFn = (args, msg, app) => {
    const commandPath = args._all;

    if (commandPath.length > 0) {
        const commandLookup = app.cli.getCommand(commandPath);

        if (!commandLookup.success) {
            return `Command '${commandPath.join(" ")}' not found`;
        }

        return getHelpSingle(commandLookup.command, commandPath, app);
    }

    return getHelpAll(app.cli.getAll().map, app);
};

export default commandCoreHelp;