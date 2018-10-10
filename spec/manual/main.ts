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

dingyLogby.setLevel(Levels.DEBUG);
clingyLogby.setLevel(Levels.DEBUG);

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
    }, no: {
        fn: () => "ok",
        args: [{
            name: "xd",
            required: true
        },{
            name: "1212312",
            required: true
        }],
        alias: [],
        data: {
            hidden: false,
            usableInDMs: false,
            powerRequired: 0,
            help: "ok"
        }
    }
};
const options = {
    prefix: "$$$",

    answerToMissingCommand: true,
    answerToMissingArgs: true,
    answerToMissingPerms: true
};
const dingy = new Dingy(commands, options);

dingy.connect(token);
