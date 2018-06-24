import { Message } from "discord.js";
interface IDingyConfigRole {
    name: string;
    power: number;
    assignable: boolean;
    check: (msg: Message) => boolean;
}
interface IDingyConfig {
    prefix: string;
    token: string;
    dataPersisted: {
        dir: string;
        files: string[];
    };
    roles: IDingyConfigRole[];
    options: {
        enableDefaultCommands: boolean;
        namesAreCaseSensitive: boolean;
        validQuotes: string[];
        answerToMissingCommand: boolean;
        answerToMissingArgs: boolean;
        answerToMissingPerms: boolean;
        sendFilesForLongReply: boolean;
        logLevel: string;
    };
}
declare const configDefault: IDingyConfig;
export { configDefault, IDingyConfig, IDingyConfigRole };
