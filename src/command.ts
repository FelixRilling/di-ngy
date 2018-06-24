import { IClingy } from "cli-ngy/src/clingy";
import { IClingyCommands } from "cli-ngy/src/lib/command";
import { Collection, Message, MessageAttachment } from "discord.js";
import { isNil, isUndefined, objDefaultsDeep, objMap } from "lightdash";
import {
    IDingyCli,
    IDingyCliArg,
    IDingyCliCommand,
    IDingyCliCommands,
    IDingyCliLookupArgs,
    IDingyCliLookupMissingArg,
    IDingyCliLookupMissingCommand,
    IDingyCliLookupSuccessful
} from "./cli";
import { IDingyConfigRole } from "./defaults/config.default";
import { IDingy } from "./dingy";
import { IDingyMessageResultExpanded, normalizeMessage } from "./message";

type dingyCommandFn = (
    args: IDingyCliLookupArgs,
    msg: Message,
    app: IDingy,
    commandLookup: IDingyCliLookupSuccessful,
    attachments: Collection<string, MessageAttachment>
) => dingyCommandResult;

type dingyCommandResult =
    | string
    | IDingyMessageResultExpanded
    | Promise<string>
    | Promise<IDingyMessageResultExpanded>;

interface IDingyCommandResolved {
    success: boolean;
    result: dingyCommandResult;
    ignore?: boolean;
}

const NO_HELP = "No help provided";

const commandDefault = {
    fn: () => "",
    args: [],
    alias: [],
    powerRequired: 0,
    hidden: false,
    usableInDMs: false,
    help: {
        short: NO_HELP
    },
    sub: null
};

const mapCommand = (key: string, command: any): IDingyCliCommand => {
    const result = <IDingyCliCommand>objDefaultsDeep(command, commandDefault);

    result.args.map(arg => (!isUndefined(arg.help) ? arg.help : NO_HELP));

    if (isUndefined(result.help.long)) {
        result.help.long = result.help.short;
    }

    if (!isNil(result.sub)) {
        result.sub = <IDingyCliCommand | IDingyCli>(
            objMap(<IClingyCommands | IClingy>result.sub, mapCommand)
        );
    }

    return result;
};

const mapCommands = (commands: any): IDingyCliCommands =>
    <IDingyCliCommands>objMap(commands, mapCommand);

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

export {
    resolveCommand,
    mapCommands,
    dingyCommandFn,
    IDingyCommandResolved,
    dingyCommandResult
};
