import { IConfig } from "./IConfig";

const DEFAULT_ROLE = {
    power: 0,
    check: () => true
};

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
        }
    }
};

export { configDefault };
