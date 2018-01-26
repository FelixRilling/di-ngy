import { objMap, isDefined } from "lightdash";
import { IDingyCommands, IDingyCommand } from "../../interfaces";

const mapCommand = (key: string, command: any): IDingyCommand => {
    const result = command;

    result.powerRequired = isDefined(result.powerRequired)
        ? result.powerRequired
        : 0;
    result.hidden = isDefined(result.hidden) ? result.hidden : false;

    result.help = isDefined(result.help) ? result.help : {};
    result.help.short = isDefined(result.help.short)
        ? result.help.short
        : "No help provided";
    result.help.long = isDefined(result.help.long)
        ? result.help.long
        : result.help.short;

    result.args = isDefined(result.args) ? result.args : [];
    result.args.map(
        arg => (isDefined(arg.help) ? arg.help : "No help provided")
    );

    if (result.sub) {
        result.sub = objMap(result.sub, mapCommand);
    }

    return result;
};

const mapCommands = (commands: any): IDingyCommands =>
    <IDingyCommands>objMap(commands, mapCommand);

export default mapCommands;
