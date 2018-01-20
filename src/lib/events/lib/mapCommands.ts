import { objMap, isUndefined } from "lightdash";
import { IDingyCommands, IDingyCommand } from "../../../interfaces";

const mapCommand = (key: string, command: any): IDingyCommand => {
    const result = command;

    result.powerRequired = !isUndefined(result.powerRequired)
        ? result.powerRequired
        : 0;
    result.hidden = !isUndefined(result.hidden) ? result.hidden : false;

    result.help = !isUndefined(result.help) ? result.help : {};
    result.help.short = !isUndefined(result.help.short)
        ? result.help.short
        : "No help provided";
    result.help.long = !isUndefined(result.help.long)
        ? result.help.long
        : result.help.short;

    result.args.map(
        arg => (!isUndefined(arg.help) ? arg.help : "No help provided")
    );

    if (result.sub) {
        result.sub = objMap(result.sub, mapCommand);
    }

    return result;
};

const mapCommands = (commands: any): IDingyCommands =>
    <IDingyCommands>objMap(commands, mapCommand);

export default mapCommands;
