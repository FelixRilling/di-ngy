import { isDefined, isNil, objDefaultsDeep, objMap } from "lightdash";
import { IDingyCliCommand, IDingyCliCommands } from "../../interfaces";

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

    result.args.map(arg => (isDefined(arg.help) ? arg.help : NO_HELP));

    if (!isDefined(result.help.long)) {
        result.help.long = result.help.short;
    }

    if (!isNil(result.sub)) {
        // @ts-ignore
        result.sub = objMap(result.sub, mapCommand);
    }

    return result;
};

const mapCommands = (commands: any): IDingyCliCommands =>
    <IDingyCliCommands>objMap(commands, mapCommand);

export default mapCommands;
