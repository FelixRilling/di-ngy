import { IConfig } from "./IConfig";

const configDefault: IConfig = {
    prefix: "$",
    roles: [],

    enableDefaultCommands: true,

    answerToMissingCommand: false,
    answerToMissingArgs: true,
    answerToMissingPerms: true,

    strings: {
        error: {
            notFound: "The command was not found: ",
            missingArgs: "Missing required arguments: ",
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
