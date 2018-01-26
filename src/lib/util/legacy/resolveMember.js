"use strict";

const toFullName = require("./toFullName");

/**
 * resolves member by id, username, name#discrim or name
 *
 * @param {string} memberResolvable
 * @param {Guild} guild
 * @returns {Member|null}
 */
module.exports = (memberResolvable, guild) => guild.members.find((member, id) =>
    id === memberResolvable ||
    toFullName(member.user) === memberResolvable ||
    member.user.username === memberResolvable ||
    member.nickname === memberResolvable
);
