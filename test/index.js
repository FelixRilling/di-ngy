"use strict";

const Dingy = require("../index");

const config = {
    name: "lisa-beta",
    prefix: "$$",
    token: process.env.DISCORD_KEY_TEST,
    options: {
        logLevel: "debug"
    },
    roles: [{
        name: "Admin",
        power: 10,
        assignable: false,
        check: (member) => ["128985967875850240"].includes(member.user.id)
    }, {
        name: "User",
        power: 1,
        assignable: true,
        check: () => true
    }],
};

const commands = {
    test: {
        fn: () => "foo",
        alias: [],
        args: [],
        help: {
            short: "Test main",
            long: "Test main"
        },
        sub: {
            weirdtype: {
                fn: () => true,
                alias: [],
                args: [],
                powerRequired: 0,
                help: {
                    short: "Test weirdtype",
                    long: "Test weirdtype"
                }
            },
            async: {
                fn: () => new Promise(resolve => setTimeout(() => {
                    resolve("success");
                }, 2000)),
                alias: [],
                args: [],
                powerRequired: 0,
                help: {
                    short: "Test async",
                    long: "Test async"
                }
            },
            long: {
                fn: () => "a".repeat(3000),
                alias: [],
                args: [],
                powerRequired: 0,
                help: {
                    short: "Test long",
                    long: "Test long"
                }
            },
            admin: {
                fn: () => "success",
                alias: [],
                args: [],
                powerRequired: 10,
                help: {
                    short: "Test admin",
                    long: "Test admin"
                }
            },
            adminMax: {
                fn: () => "success",
                alias: [],
                args: [],
                powerRequired: 11,
                help: {
                    short: "Test admin max",
                    long: "Test admin max"
                }
            },
            args: {
                fn: () => "success",
                alias: [],
                args: [{
                    name: "foo",
                    required: true
                }],
                powerRequired: 0,
                help: {
                    short: "Test args",
                    long: "Test args"
                }
            },
            attachment: {
                fn: () => ["success", false, ["http://lorempixel.com/output/food-q-c-640-480-10.jpg"]],
                alias: [],
                args: [],
                powerRequired: 0,
                help: {
                    short: "Test attachment",
                    long: "Test attachment"
                }
            },
            event: {
                fn: () => ["baaaaaaa", false, [], {
                    onSend: msg => msg.react("128985967875850240")
                }],
                alias: ["events"],
                args: [],
                powerRequired: 0,
                help: {
                    short: "Test event",
                    long: "Test event"
                }
            },
        }
    },
};

const bot = new Dingy(config, commands);

bot.connect();
