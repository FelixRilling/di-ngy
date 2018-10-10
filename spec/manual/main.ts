import { clingyLogby } from "cli-ngy";
import { isNil } from "lightdash";
import { Levels } from "logby";
import { Dingy } from "src/Dingy";
import { dingyLogby } from "../../src/logger";

/*
 * Used to directly run and test the bot.
 */
const token = process.env.DISCORD_TOKEN_TEST;

if (isNil(token)) {
    throw new Error("No token set.");
}

dingyLogby.setLevel(Levels.TRACE);
clingyLogby.setLevel(Levels.TRACE);

const commands = {
    foo: {
        fn: () => "ok",
        args: [],
        alias: [],
        data: {
            hidden: false,
            usableInDMs: true,
            powerRequired: 0,
            help: "ok"
        }
    }
};
const options = {
    prefix: "$$$",
    roles: [],

    enableDefaultCommands: true,

    answerToMissingCommand: true,
    answerToMissingArgs: true,
    answerToMissingPerms: true
};
const dingy = new Dingy(commands, options);

dingy.connect(token);
