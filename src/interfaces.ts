import { Client, GuildMember, Guild, Message, Attachment } from "discord.js";
import { IClingy } from "cli-ngy/src/interfaces";
import { commandFn, commandResult } from "./types";

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

interface IDingyCommand {
    alias: string[];
    sub: IDingyCommands | null;

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

interface IDingyCommandArgs {
    [key: string]: string | string[];
    _all: string[];
}

interface IDingyCommands {
    [key: string]: IDingyCommand;
}

interface IDingyLookupSuccessful {
    success: true;
    command: IDingyCommand;
    path: string[];
    pathDangling: string[];
    args?: IDingyCommandArgs;
}

interface IDingyLookupUnsuccessful {
    success: false;
    error: {
        type: "missingCommand" | "missingArg";
        missing: string[] | IDingyCommandArg[];
        similar?: string[];
    };
    path?: string[];
}

interface IDingyCommandResolved {
    success: boolean;
    result: commandResult;
    ignore?: boolean;
}

interface IDingyMessageResultExpanded {
    0: string;
    1?: boolean | string;
    2?: string[] | Attachment[];
    3?: IDingyMessageResultEvents;
}

interface IDingyMessageResultEvents {
    onSend: (msg: Message) => void;
}

export {
    IDingy,
    IDingyStrings,
    IDingyConfig,
    IDingyConfigRole,
    IDingyUserEvents,
    IDingyCommand,
    IDingyCommandArg,
    IDingyCommandArgs,
    IDingyCommands,
    IDingyLookupSuccessful,
    IDingyLookupUnsuccessful,
    IDingyCommandResolved,
    IDingyMessageResultExpanded,
    IDingyMessageResultEvents
};
