import { Guild, GuildMember, Message } from "discord.js";
import {
    IDingy,
    IDingyConfigRole,
    IDingyCommand,
    IDingyCommandLookup,
    IDingyMessageResultEvents,
    IDingyMessageResultExpanded
} from "../../../interfaces";
import humanizeListOptionals from "../../util/humanizeListOptionals";
import { isString, objDefaultsDeep } from "lightdash";

const eventsDefault: IDingyMessageResultEvents = {
    onSend: () => {}
};

const dataDefaults: IDingyMessageResultExpanded = [
    "",
    false,
    [],
    eventsDefault
];

/**
 * Runs data through defaults and transforms
 *
 * @param {any} data
 * @returns {Object}
 */
const mapResult = data => {
    /*     let dataObj = data;

    if (isString(dataObj)) {
        dataObj = [dataObj];
    }

    dataObj = objDefaultsDeep(dataObj, dataDefaults);

    return {
        text: dataObj[0],
        code: dataObj[1],
        files: dataObj[2],
        events: dataObj[3]
    }; */

    return null;
};

const hasPermissions = (
    powerRequired: number,
    roles: IDingyConfigRole[],
    member: GuildMember,
    guild: Guild
): boolean => {
    const checkResults = roles.map(
        role => (role.check(member, guild) ? role.power : 0)
    );

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
const resolveCommandResult = (str: string, msg: Message, app: IDingy) => {
    /* const commandLookup: IDingyCommandLookup = app.cli.parse(str);

    // Command check
    if (commandLookup.success) {
        const command = commandLookup.command;

        // Permission check
        if (
            hasPermissions(
                command.powerRequired,
                app.config.roles,
                msg.member,
                msg.guild
            )
        ) {
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
        } else {
            return app.config.options.answerToMissingPerms
                ? {
                      result: `${app.strings.errorPermission}`,
                      success: false
                  }
                : false;
        }
    } else {
        const error = commandLookup.error;

        if (error.type === "missingCommand") {
            if (app.config.options.answerToMissingCommand) {
                const content = [
                    `${app.strings.errorUnknownCommand} '${error.missing}'`
                ];

                if (error.similar.length > 0) {
                    content.push(
                        `${app.strings.infoSimilar} ${humanizeListOptionals(
                            error.similar
                        )}?`
                    );
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
                    result: `${
                        app.strings.errorMissingArgs
                    } ${missingNames.join(",")}`,
                    success: false
                };
            } else {
                return false;
            }
        } else {
            return false;
        }
    } */
};

const resolveCommand = (str: string, msg: Message, app: IDingy) =>
    mapResult(resolveCommandResult(str, msg, app));

export default resolveCommand;
