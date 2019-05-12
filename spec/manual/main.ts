/*
 * Used to directly run and test the bot.
 */

import { clingyLogby } from "cli-ngy";
import { Message } from "discord.js";
import { isNil } from "lightdash";
import { Levels } from "logby";
import { Dingy } from "src/Dingy";
import { IDingyCommandObject } from "../../src/command/IDingyCommandObject";
import { DEFAULT_ROLE } from "../../src/config/config.default";
import { dingyLogby } from "../../src/logger";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN_TEST;

if (isNil(DISCORD_TOKEN)) {
    throw new Error("No token set.");
}

dingyLogby.setLevel(Levels.TRACE);
clingyLogby.setLevel(Levels.TRACE);

const commands: IDingyCommandObject = {
    nest: {
        fn: () => "nest",
        args: [],
        alias: [],
        data: {
            hidden: false,
            usableInDMs: false,
            powerRequired: 0,
            help: "nest"
        },
        sub: {
            ed: {
                fn: () => "nested",
                args: [
                    {
                        name: "foo",
                        required: false
                    }
                ],
                alias: [],
                data: {
                    hidden: false,
                    usableInDMs: false,
                    powerRequired: 0,
                    help: "nested"
                }
            }
        }
    }
};
const options = {
    prefix: "$$$",

    roles: [
        DEFAULT_ROLE,
        {
            check: (msg: Message) => msg.author.id === "128985967875850240",
            power: 999
        }
    ],

    answerToMissingCommand: true,
    answerToMissingArgs: true,
    answerToMissingPerms: true
};
const dingy = new Dingy(commands, options);

dingy.connect(DISCORD_TOKEN).catch(console.error);
