import { IConfig } from "./IConfig";

const configDefault: IConfig = {
    prefix: "$",
    roles: [],

    legalQuotes: ["\""],
    caseSensitive: false,
    enableDefaultCommands: true,

    answerToMissingCommand: false,
    answerToMissingArgs: true,
    answerToMissingPerms: true
};

export { configDefault };
