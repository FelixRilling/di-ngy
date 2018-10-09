/*
 * Used to directly run and test the bot.
 */

const Dingy = require("../dist/dingy.common");

Dingy.loggerRoot.level = { val: 999 };

const dingy = new Dingy();
const token = process.env.DISCORD_TOKEN_TEST;

dingy.connect(token);
