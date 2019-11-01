import { Clingy, LookupSuccess } from "cli-ngy";

import { stringify } from "yamljs";
import { Dingy } from "../../Dingy";
import { ICommandResponse } from "../../message/response/ICommandResponse";
import { IDingyCommand } from "../IDingyCommand";
import { Argument } from "cli-ngy/dist/esm/src/argument/Argument";
import { CommandMap } from "cli-ngy/dist/esm/src/command/CommandMap";

interface ISlimCommand {
    desc: string;
    powerRequired?: number;
    usableInDMs?: boolean;
    alias?: string[];
    args?: Argument[];
    sub?: string[];
}

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
const createSlimCommand = (
    command: IDingyCommand,
    showDetails = false
): object => {
    const result: ISlimCommand = {
        desc: command.data.help
    };

    if (showDetails) {
        result.powerRequired = command.data.powerRequired;
        result.usableInDMs = command.data.usableInDMs;
        if (command.args.length > 0) {
            result.args = command.args;
        }
        if (command.alias.length > 0) {
            result.alias = command.alias;
        }
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
    dingy: Dingy,
    clingy: Clingy,
    argsAll: string[]
): ICommandResponse => {
    const lookupResult = clingy.getPath(argsAll);

    // prematurely assume success to combine hidden + success check.
    const command = <IDingyCommand>(<LookupSuccess>lookupResult).command;
    if (!lookupResult.successful || command.data.hidden) {
        return {
            val: `Command '${argsAll.join("->")}' does not exist.`,
            code: true
        };
    }

    return {
        val: [
            `Help: '${lookupResult.pathUsed.join("->")}'`,
            dingy.config.strings.separator,
            stringify(createSlimCommand(command, true))
        ].join("\n"),
        code: "yaml"
    };
};

/**
 * @private
 */
const showGeneralHelp = (dingy: Dingy, clingy: Clingy): ICommandResponse => {
    return {
        val: [
            "Help",
            dingy.config.strings.separator,
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
            ? showDetailHelp(dingy, clingy, argsAll)
            : showGeneralHelp(dingy, clingy)
};

export { help };
