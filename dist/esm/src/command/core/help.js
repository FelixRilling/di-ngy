import { stringify } from "yamljs";
/**
 * @private
 */
const createSlimCommandTree = (map) => {
    const result = {};
    map.forEach((command, key) => {
        if (!command.data.hidden) {
            result[key] = createSlimCommand(command);
        }
    });
    return result;
};
/**
 * @private
 */
const createSlimCommand = (command, showDetails = false) => {
    const result = {
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
        result.sub = Array.from(command.sub.map.keys());
    }
    return result;
};
/**
 * @private
 */
const showDetailHelp = (dingy, clingy, argsAll) => {
    const lookupResult = clingy.getPath(argsAll);
    // prematurely assume success to combine hidden + success check.
    const command = lookupResult.command;
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
const showGeneralHelp = (dingy, clingy) => {
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
const help = {
    alias: ["manual", "?"],
    args: [],
    sub: null,
    data: {
        powerRequired: 0,
        hidden: false,
        usableInDMs: true,
        help: "Shows the help page."
    },
    fn: (args, argsAll, msg, dingy, clingy) => argsAll.length > 0
        ? showDetailHelp(dingy, clingy, argsAll)
        : showGeneralHelp(dingy, clingy)
};
export { help };
//# sourceMappingURL=help.js.map