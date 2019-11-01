import { Clingy, LookupSuccess } from "cli-ngy";

import { stringify } from "yamljs";
import { Dingy } from "../../Dingy";
import { CommandResponse } from "../../message/response/CommandResponse";
import { DingyCommand } from "../DingyCommand";
import { Argument } from "cli-ngy/dist/esm/src/argument/Argument";
import { CommandMap } from "cli-ngy/dist/esm/src/command/CommandMap";

interface SlimCommand {
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
const createSlimCommand = (
    command: DingyCommand,
    showDetails = false
): object => {
    const result: SlimCommand = {
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
const createSlimCommandTree = (map: CommandMap): object => {
    const result: { [key: string]: any } = {};

    map.forEach((command, key) => {
        if (!(<DingyCommand>command).data.hidden) {
            result[key] = createSlimCommand(<DingyCommand>command);
        }
    });

    return result;
};

/**
 * @private
 */
const showDetailHelp = (
    dingy: Dingy,
    clingy: Clingy,
    argsAll: string[]
): CommandResponse => {
    const lookupResult = clingy.getPath(argsAll);

    // Prematurely assume success to combine hidden + success check.
    const command = <DingyCommand>(<LookupSuccess>lookupResult).command;
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
const showGeneralHelp = (dingy: Dingy, clingy: Clingy): CommandResponse => {
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
const help: DingyCommand = {
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
