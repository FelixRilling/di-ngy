"use strict";

module.exports = {
    prefix: "myPrefix", //Prefix to respond to: prefix:'foo' => responds to "foo help"
    token: "#botToken#", //Bot-token, should be secret! (Using ENV-vars to store this is recommended)
    dataPersisted: {
        dir: "./data/", //Directory to store JSONs, relative from base directory
        files: [] //File names, "foo" will be saved as "foo.json" and can be accessed with bot.dataPersisted.foo
    },
    roles: [{
        name: "Admin",
        power: 10,
        assignable: false,
        check: (member) => [].includes(member.user.id)
    }, {
        name: "User",
        power: 1,
        assignable: true,
        check: () => true
    }],
    options: {
        enableDefaultCommands: true, //If the built-in "about", "help" and "eval" commands should be active
        namesAreCaseSensitive: false, //cli-ngy:If false, "#botPrefix# hElP" will work too
        allowQuotedStrings: true, //cli-ngy:If strings containing spaces should be kept together when enclosed in quotes.
        validQuotes: ["\""], //cli-ngy:List of characters to support enclosing quotedStrings for.

        answerToMissingCommand: false, //If a message should be sent indicating that the command requested doesn't exist
        answerToMissingArgs: true, //If a message should be sent indicating that arguments were missing
        answerToMissingPerms: true, //If a message should be sent indicating that permissions were missing

        sendFilesForLongReply: true, //If replies over 2000 chars should be sent as file instead

        logLevel: "debug" //Level of log messages recommended to be either "debug" or "info", but can be any supported log-level
    }
};
