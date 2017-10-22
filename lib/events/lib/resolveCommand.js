"use strict";

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

const hasPermissions = function (powerRequired, roles, member, guild) {
    const checkResults = roles.map(role => role.check(member, guild) ? role.power : 0);

    return Math.max(...checkResults) >= powerRequired;
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
    const commandLookup = app.cli.parse(str);

    //Command check
    if (commandLookup.success) {
        const command = commandLookup.command;

        //Permission check
        if (hasPermissions(command.powerRequired, app.config.roles, msg.member, msg.guild)) {
            //Run command fn
            const result = command.fn(
                commandLookup.args,
                msg,
                app,
                commandLookup,
                msg.attachments
            );

            return {
                result,
                success: true
            };
        } else {
            return app.config.options.answerToMissingPerms ? {
                result: `${app.strings.errorPermission}`,
                success: false
            } : false;
        }
    } else {
        const error = commandLookup.error;

        if (error.type === "missingCommand") {
            if (app.config.options.answerToMissingCommand) {
                const content = [`${app.strings.errorUnknownCommand} '${error.missing}'`];

                if (error.similar.length > 0) {
                    content.push(`${app.strings.infoSimilar} ${humanizeListOptionals( error.similar)}?`);
                }

                return {
                    result: content.join("\n"),
                    success: false
                };
            } else {
                return false;
            }
        } else if (error.type === "missingArg") {
            if (app.config.options.answerToMissingArgs) {
                const missingNames = error.missing.map(item => item.name);

                return {
                    result: `${app.strings.errorMissingArgs} ${missingNames.join(",")}`,
                    success: false
                };
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};
