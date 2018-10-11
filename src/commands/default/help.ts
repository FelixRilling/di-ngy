import { Clingy, ILookupSuccess } from "cli-ngy";
import { IArgument } from "cli-ngy/types/argument/IArgument";
import { CommandMap } from "cli-ngy/types/command/CommandMap";
import { stringify } from "yamljs";
import { ICommandResponse } from "../../message/response/ICommandResponse";
import { IDingyCommand } from "../IDingyCommand";

interface ISlimCommand {
    desc: string;
    powerRequired: number;
    usableInDMs: boolean;
    alias?: string[];
    args?: IArgument[];
    sub?: string[];
}

const LINE_SEPARATOR = "-".repeat(9);

/**
 * @private
 */
const createSlimCommandTree = (map: CommandMap): object => {
    const result: { [key: string]: any } = {};

    map.forEach((command, key) => {
        if (!(<IDingyCommand>command).data.hidden) {
            result[key] = createSlimCommand(<IDingyCommand>command);
        }
    });

    return result;
};

/**
 * @private
 */
const createSlimCommand = (command: IDingyCommand): object => {
    const result: ISlimCommand = {
        desc: command.data.help,
        powerRequired: command.data.powerRequired,
        usableInDMs: command.data.usableInDMs
    };

    if (command.alias.length > 0) {
        result.alias = command.alias;
    }
    if (command.args.length > 0) {
        result.args = command.args;
    }
    if (command.sub != null) {
        result.sub = Array.from((<Clingy>command.sub).map.keys());
    }

    return result;
};

/**
 * @private
 */
const showDetailHelp = (
    clingy: Clingy,
    argsAll: string[]
): ICommandResponse => {
    const lookupResult = clingy.getPath(argsAll);

    // prematurely assume success to combine hidden + success check.
    const command = <IDingyCommand>(<ILookupSuccess>lookupResult).command;
    if (!lookupResult.successful || command.data.hidden) {
        return {
            val: `Command '${argsAll.join("->")}' does not exist.`,
            code: "yaml"
        };
    }

    return {
        val: [
            `Help for: '${lookupResult.pathUsed.join("->")}'`,
            LINE_SEPARATOR,
            stringify(createSlimCommand(command))
        ].join("\n"),
        code: "yaml"
    };
};

/**
 * @private
 */
const showGeneralHelp = (clingy: Clingy): ICommandResponse => {
    return {
        val: [
            "Help",
            LINE_SEPARATOR,
            stringify(createSlimCommandTree(clingy.map))
        ].join("\n"),
        code: "yaml"
    };
};

/**
 * Built-in "help" command.
 *
 * @private
 */
const help: IDingyCommand = {
    alias: ["manual", "?"],
    args: [],
    sub: null,
    data: {
        powerRequired: 0,
        hidden: false,
        usableInDMs: true,
        help: "Shows the help page."
    },
    fn: (args, argsAll, msg, dingy, clingy) =>
        argsAll.length > 0
            ? showDetailHelp(clingy, argsAll)
            : showGeneralHelp(clingy)
};

export { help };
