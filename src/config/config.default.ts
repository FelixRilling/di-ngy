import { IConfig } from "./IConfig";

/**
 * Default role for every user.
 */
const DEFAULT_ROLE = {
    power: 0,
    check: () => true
};

/**
 * Default config settings.
 *
 * @private
 */
const configDefault: IConfig = {
    prefix: "$",
    roles: [DEFAULT_ROLE],

    enableDefaultCommands: true,

    answerToMissingCommand: false,
    answerToMissingArgs: true,
    answerToMissingPerms: true,

    strings: {
        error: {
            notFound: "The command was not found: ",
            missingArgs: "Missing required argument(s): ",
            noPermission:
                "You do not have the permissions to use this command.",
            invalidDMCall: "This command cannot be used in DMs."
        },
        response: {
            empty: "Empty response.",
            tooLong: "The output was too long to send."
        },
        separator: "-".repeat(9)
    }
};

export { configDefault, DEFAULT_ROLE };
