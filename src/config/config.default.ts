import { IConfig } from "./IConfig";

const configDefault: IConfig = {
    prefix: "$",
    roles: [],

    enableDefaultCommands: true,

    answerToMissingCommand: false,
    answerToMissingArgs: true,
    answerToMissingPerms: true
};

export { configDefault };
