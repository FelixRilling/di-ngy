"use strict";

const toFullName = require("./toFullName");


/**
 * resolves member by id, username, name#discrim or name
 *
 * @param {string} memberResolvable
 * @param {Guild} guild
 * @returns {Member|null}
 */
module.exports = (memberResolvable, guild) => guild.members.find((val, id) =>
    id === memberResolvable ||
    toFullName(val.user) === memberResolvable ||
    val.user.username === memberResolvable ||
    val.nickname === memberResolvable
);
