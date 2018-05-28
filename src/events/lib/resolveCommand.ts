import { Message } from "discord.js";
import {
    IDingy,
    IDingyCliArg,
    IDingyCliLookupMissingArg,
    IDingyCliLookupMissingCommand,
    IDingyCommandResolved,
    IDingyConfigRole
} from "../../interfaces";
import { normalizeMessage } from "./normalizeMessage";

const hasPermissions = (
    powerRequired: number,
    roles: IDingyConfigRole[],
    msg: Message
): boolean => {
    const checkResults = roles.map(role => (role.check(msg) ? role.power : 0));

    return Math.max(...checkResults) >= powerRequired;
};

const resolveCommandResult = (str: string, msg: Message, app: IDingy) => {
    const commandLookup = app.cli.parse(str);

    // Command check
    if (commandLookup.success) {
        const command = commandLookup.command;
        const isDM = !msg.guild;

        if (isDM && !command.usableInDMs) {
            return false;
        }

        // Permission check
        if (!hasPermissions(command.powerRequired, app.config.roles, msg)) {
            return app.config.options.answerToMissingPerms
                ? {
                      result: `${app.strings.errorPermission}`,
                      success: false
                  }
                : false;
        }

        // Run command fn
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
    }
    const error = (<IDingyCliLookupMissingArg | IDingyCliLookupMissingCommand>(
        commandLookup
    )).error;

    if (error.type === "missingCommand") {
        if (app.config.options.answerToMissingCommand) {
            const content = [
                `${app.strings.errorUnknownCommand} '${error.missing}'`
            ];

            if (error.similar.length > 0) {
                content.push(
                    `${
                        app.strings.infoSimilar
                    } ${app.util.humanizeListOptionals(error.similar)}?`
                );
            }

            return {
                result: content.join("\n"),
                success: false
            };
        }

        return false;
    } else if (error.type === "missingArg") {
        if (app.config.options.answerToMissingArgs) {
            const missingNames = (<IDingyCliArg[]>error.missing).map(
                item => item.name
            );

            return {
                result: `${app.strings.errorMissingArgs} ${missingNames.join(
                    ","
                )}`,
                success: false
            };
        }

        return false;
    }

    return false;
};

const resolveCommand = (str: string, msg: Message, app: IDingy) =>
    normalizeMessage(resolveCommandResult(str, msg, app));

export { resolveCommand };
