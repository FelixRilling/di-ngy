import { Guild, GuildMember, Message } from "discord.js";
import {
    IDingy,
    IDingyConfigRole,
    IDingyCommand,
    IDingyCommandArg,
    IDingyLookupSuccessful,
    IDingyLookupUnsuccessful,
    IDingyCommandResolved,
    IDingyMessageResultEvents,
    IDingyMessageResultExpanded
} from "../../../interfaces";
import humanizeListOptionals from "../../util/humanizeListOptionals";
import { normalizeMessage } from "./normalizeMessage";

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

const resolveCommandResult = (str: string, msg: Message, app: IDingy) => {
    // @ts-ignore
    const commandLookup:
        | IDingyLookupSuccessful
        | IDingyLookupUnsuccessful = app.cli.parse(str);

    // Command check
    if (commandLookup.success) {
        const command = (<IDingyLookupSuccessful>commandLookup).command;

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
        const error = (<IDingyLookupUnsuccessful>commandLookup).error;

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
                const missingNames = (<IDingyCommandArg[]>error.missing).map(
                    item => item.name
                );

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
    }
};

const resolveCommand = (str: string, msg: Message, app: IDingy) =>
    normalizeMessage(resolveCommandResult(str, msg, app));

export default resolveCommand;
