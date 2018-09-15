import { IRole } from "./IRole";

interface IConfig {
    prefix: string;
    roles: IRole[];

    caseSensitive: boolean;
    legalQuotes: string[];
    enableDefaultCommands: boolean;

    answerToMissingCommand: boolean;
    answerToMissingArgs: boolean;
    answerToMissingPerms: boolean;
}

export { IConfig };
