"use strict";

const jsonToYaml = require("../../util/jsonToYaml");


/**
 * Turns an array into a humanized string
 *
 * @param {Array<string>} arr
 * @returns {string}
 */
const humanizeList = arr => arr.map(key => `'${key}'`).join(", ")

/**
 * Displays list of all non-hidden commands
 *
 * @param {Object} commands
 * @param {Dingy} app
 * @returns {string}
 */
const getHelpAll = function (commands, app) {
    const result = {};

    commands.map.forEach((command, commandName) => {
        if (!command.hidden) {
            if (command.sub) {
                result[commandName] = {
                    desc: command.help.short,
                    sub: humanizeList(Array.from(command.sub.map.keys()))
                };
            } else {
                result[commandName] = command.help.short;
            }
        }
    });

    return ["Help", app.strings.separator, jsonToYaml(result)].join("\n");
};

/**
 * Displays help for a single command
 *
 * @param {Object} command
 * @param {Array<string>} commandPath
 * @param {Dingy} app
 * @returns {string}
 */
const getHelpSingle = function (command, commandPath, app) {
    const result = {
        desc: command.help.long
    };

    if (command.alias.length > 0) {
        result.alias = humanizeList(command.alias);
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

    if (command.sub) {
        result.sub = Array.from(command.sub.getAll().map.keys());
    }

    return [`Help for '${commandPath.join(" ")}'`, app.strings.separator, jsonToYaml(result)].join("\n");
};

/**
 * Displays help
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
module.exports = function (args, msg, app) {
    const commandPath = args._all;

    if (commandPath.length > 0) {
        const commandLookup = app.cli.getCommand(commandPath);

        if (commandLookup.success) {
            return [getHelpSingle(commandLookup.command, commandPath, app), "yaml"];
        } else {
            return [`Command '${commandPath.join(" ")}' not found`, "error"];
        }
    } else {
        const commandAll = app.cli.getAll();

        return [getHelpAll(commandAll, app), "yaml"];
    }
};
