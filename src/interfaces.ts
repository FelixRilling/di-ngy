import {
    IClingy,
    IClingyArg,
    IClingyCommand,
    IClingyOptions
} from "cli-ngy/src/interfaces";
import {
    Attachment,
    Client,
    DMChannel,
    GroupDMChannel,
    Guild,
    GuildChannel,
    GuildMember,
    Message,
    MessageAttachment,
    TextChannel,
    User
} from "discord.js";
import {
    dingyCliCommandMap,
    dingyCommandFn,
    dingyCommandResult
} from "./types";

/**
 * General
 */

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
    check: (
        member: GuildMember,
        guild: Guild,
        channel: TextChannel | DMChannel | GroupDMChannel
    ) => boolean;
}

interface IDingyUserEvents {
    onInit: (app: IDingy) => void;
    onConnect: (app: IDingy) => void;
    onMessage: (msg: Message, app: IDingy) => void;
}

interface IDingyCommandResolved {
    success: boolean;
    result: dingyCommandResult;
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

interface IDingyUtils {
    decycle: (object: any, replacer?: (val: any) => any) => any;
    humanizeList: (arr: string[]) => string;
    humanizeListOptionals: (arr: string[]) => string;
    jsonToYaml: (obj: any) => string;
    loadAttachment: (attachment: MessageAttachment) => Promise<string>;
    resolveChannel: (channelResolvable: string, guild: Guild) => GuildChannel;
    resolveMember: (memberResolvable: string, guild: Guild) => GuildMember;
    resolveUser: (userResolvable: string, bot: Client) => Promise<User>;
    stripBotData: (obj: any) => any;
    toFullName: (user: User) => string;
}

interface IDingy {
    config: IDingyConfig;
    strings: IDingyStrings;
    userEvents: IDingyUserEvents;

    data: object;
    dataPersisted: object;

    bot: Client;
    cli: IDingyCli;
    logger: any;
    util: IDingyUtils;

    connect: () => void;
}

/**
 * Cli
 */
interface IDingyCli {
    options: IClingyOptions;
    map: dingyCliCommandMap;
    mapAliased: dingyCliCommandMap;
    getAll(): {
        map: dingyCliCommandMap;
        mapAliased: dingyCliCommandMap;
    };
    getCommand(
        path: string[],
        pathUsed?: string[]
    ): IDingyCliLookupSuccessful | IDingyCliLookupMissingCommand;
    parse(
        input: string
    ):
        | IDingyCliLookupSuccessful
        | IDingyCliLookupMissingCommand
        | IDingyCliLookupMissingArg;
}

interface IDingyCliLookupSuccessful {
    success: true;
    command: IDingyCliCommand;
    path: string[];
    pathDangling: string[];
    args?: IDingyCliLookupArgs;
}

interface IDingyCliLookupMissingCommand {
    success: false;
    error: {
        type: "missingCommand";
        missing: string[];
        similar: string[];
    };
    path: string[];
}

interface IDingyCliLookupMissingArg {
    success: false;
    error: {
        type: "missingArg";
        missing: IDingyCliArg[];
    };
}

interface IDingyCliLookupArgs {
    [key: string]: string | string[];
    _all: string[];
}

interface IDingyCliOptions {
    caseSensitive: boolean;
    validQuotes: string[];
}

interface IDingyCliArg extends IClingyArg {
    help: string;
}

interface IDingyCliCommand extends IClingyCommand {
    powerRequired: number;
    hidden: boolean;
    help: {
        short: string;
        long: string;
    };
}

interface IDingyCliCommands {
    [key: string]: IDingyCliCommand;
}

export {
    IDingy,
    IDingyUtils,
    IDingyStrings,
    IDingyConfig,
    IDingyConfigRole,
    IDingyUserEvents,
    IDingyCommandResolved,
    IDingyMessageResultExpanded,
    IDingyMessageResultEvents,
    IDingyCli,
    IDingyCliArg,
    IDingyCliCommand,
    IDingyCliCommands,
    IDingyCliLookupArgs,
    IDingyCliLookupMissingArg,
    IDingyCliLookupMissingCommand,
    IDingyCliLookupSuccessful,
    IDingyCliOptions
};
