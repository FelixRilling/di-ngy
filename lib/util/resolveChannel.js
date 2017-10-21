"use strict";

/**
 * resolves channel by id or name
 *
 * @param {string} channelResolvable
 * @param {Guild} guild
 * @returns {Channel|null}
 */
module.exports = (channelResolvable, guild) => guild.channels.find((channel, id) =>
    id === channelResolvable ||
    channel.name === channelResolvable
);
