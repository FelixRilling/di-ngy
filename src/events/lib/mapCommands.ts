import { isNil, isUndefined, objDefaultsDeep, objMap } from "lightdash";
import {
    IClingy,
    IClingyCommand,
    IClingyCommands
} from "../../../../cli-ngy/src/interfaces";
import {
    IDingyCli,
    IDingyCliCommand,
    IDingyCliCommands
} from "../../interfaces";

const NO_HELP = "No help provided";

const commandDefault = {
    fn: () => "",
    args: [],
    alias: [],
    powerRequired: 0,
    hidden: false,
    usableInDMs: false,
    help: {
        short: NO_HELP
    },
    sub: null
};

const mapCommand = (key: string, command: any): IDingyCliCommand => {
    const result = <IDingyCliCommand>objDefaultsDeep(command, commandDefault);

    result.args.map(arg => (!isUndefined(arg.help) ? arg.help : NO_HELP));

    if (isUndefined(result.help.long)) {
        result.help.long = result.help.short;
    }

    if (!isNil(result.sub)) {
        result.sub = <IDingyCliCommand | IDingyCli>objMap(
            <IClingyCommands | IClingy>result.sub,
            mapCommand
        );
    }

    return result;
};

const mapCommands = (commands: any): IDingyCliCommands =>
    <IDingyCliCommands>objMap(commands, mapCommand);

export default mapCommands;
