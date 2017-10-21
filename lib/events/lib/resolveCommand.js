"use strict";

const {
    isArray
} = require("lodash");

/**
 * Turns an array into a humanized string of optionals
 *
 * @param {Array<string>} arr
 * @returns {string}
 */
const humanizeListOptionals = function (arr) {
    return arr.map((item, index, data) => {
        if (index === 0) {
            return `'${item}'`;
        } else if (index < data.length - 1) {
            return `, '${item}'`;
        } else {
            return ` or '${item}'`;
        }
    }).join("");
};

/**
 * Resolves a command string input
 *
 * @param {string} str
 * @param {Message} msg
 * @param {Dingy} app
 * @returns {Array<any>|false}
 */
module.exports = function (str, msg, app) {
    const callerIsAdmin = app.config.adminIds.includes(msg.author.id);
    const commandLookup = app.cli.parse(str);

    //Command check
    if (commandLookup.success) {
        const command = commandLookup.command;

        //Permission check
        if (!command.admin || callerIsAdmin) {
            //Run command fn
            const result = command.fn(
                commandLookup.args,
                msg,
                app,
                commandLookup,
                msg.attachments
            );

            return isArray(result) ? result : [result];
        } else {
            return app.config.options.answerToMissingPerms ? [app.strings.errorPermission, true] : false;
        }
    } else {
        const error = commandLookup.error;

        if (error.type === "missingCommand") {
            if (app.config.options.answerToMissingCommand) {
                const similar = error.similar.filter(commandName => !app.cli.getCommand([commandName]).command.admin);
                const content = [`${app.strings.errorUnknownCommand} '${error.missing}'`];

                if (similar.length > 0) {
                    content.push(`${app.strings.infoSimilar} ${humanizeListOptionals(similar)}?`);
                }

                return [content.join("\n"), true];
            } else {
                return false;
            }
        } else if (error.type === "missingArg") {
            if (app.config.options.answerToMissingArgs) {
                const missingNames = error.missing.map(item => item.name);

                return [`${app.strings.errorMissingArgs} ${missingNames.join(",")}`, true];
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};
