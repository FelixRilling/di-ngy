"use strict";

const _isArray = require("lodash/isArray");
const humanizeList = require("../../util/humanizeList");
const humanizeListOptionals = require("../../util/humanizeListOptionals");

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

            return _isArray(result) ? result : [result];
        } else {
            return app.config.options.answerToMissingPerms ? [app.strings.errorPermission, "error"] : false;
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

                return [content.join("\n"), "error"];
            } else {
                return false;
            }
        } else if (error.type === "missingArg") {
            if (app.config.options.answerToMissingArgs) {
                const missingNames = error.missing.map(item => item.name);

                return [`${app.strings.errorMissingArgs} ${humanizeList(missingNames)}`, "error"];
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};
