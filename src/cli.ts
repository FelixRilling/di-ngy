import { IClingy } from "cli-ngy/src/clingy";
import { IClingyArg } from "cli-ngy/src/lib/arg";
import { IClingyCommand } from "cli-ngy/src/lib/command";
import { missingErrorTypes } from "cli-ngy/src/lib/lookup";
import { IClingyOptions } from "cli-ngy/src/lib/options";

type dingyCliCommandEntry = [string, IDingyCliCommand];

type dingyCliCommandEntries = dingyCliCommandEntry[];

type dingyCliCommandMap = Map<string, IDingyCliCommand>;

interface IDingyCli extends IClingy {
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
        type: missingErrorTypes.command;
        missing: string[];
        similar: string[];
    };
    path: string[];
}

interface IDingyCliLookupMissingArg {
    success: false;
    error: {
        type: missingErrorTypes.arg;
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
    usableInDMs: boolean;
    help: {
        short: string;
        long: string;
    };
}

interface IDingyCliCommands {
    [key: string]: IDingyCliCommand;
}

export {
    IDingyCli,
    IDingyCliArg,
    IDingyCliCommand,
    IDingyCliCommands,
    IDingyCliLookupArgs,
    IDingyCliLookupMissingArg,
    IDingyCliLookupMissingCommand,
    IDingyCliLookupSuccessful,
    IDingyCliOptions,
    dingyCliCommandEntry,
    dingyCliCommandEntries,
    dingyCliCommandMap
};
