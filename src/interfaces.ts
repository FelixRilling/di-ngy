import { Client, GuildMember, Guild, Message } from "discord.js";
import { IClingyCommand, IClingyCommands } from "cli-ngy/src/interfaces";
import { commandFn } from "./types";

interface IDingy {
    config: IDingyConfig;
    strings: IDingyStrings;
    userEvents: IDingyUserEvents;

    data: object;
    dataPersisted: object;

    cli: IClingy;
    log: any;
    bot: Client;

    connect: () => void;
}

interface IDingyStrings {
    currentlyPlaying: string;

    separator: string;

    infoSimilar: string;
    infoEmpty: string;
    infoTooLong: string;
    infoInternal: string;

    errorUnknownCommand: string;
    errorMissingArgs: string;
    errorPermission: string;
    errorTooLong: string;
    errorInternal: string;
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

interface IDingyConfigRole {
    name: string;
    power: number;
    assignable: boolean;
    check: (member: GuildMember, guild: Guild) => boolean;
}

interface IDingyUserEvents {
    onInit: (app: IDingy) => void;
    onConnect: (app: IDingy) => void;
    onMessage: (msg: Message, app: IDingy) => void;
}

interface IDingyCommand extends IClingyCommand {
    name?: string;
    fn: commandFn;
    powerRequired: number;
    hidden: boolean;
    help: {
        short: string;
        long: string;
    };
    args: IDingyCommandArg[];
}

interface IDingyCommandArg {
    name: string;
    required: boolean;
    default?: any;
    help: string;
}

interface IDingyCommands extends IClingyCommands {
    [key: string]: IDingyCommand;
}

export {
    IDingy,
    IDingyStrings,
    IDingyConfig,
    IDingyConfigRole,
    IDingyUserEvents,
    IDingyCommand,
    IDingyCommandArg,
    IDingyCommands
};
