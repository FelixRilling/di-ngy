import { Guild, GuildChannel } from "discord.js";

/**
 * resolves channel by id or name
 *
 * @private
 * @param {string} channelResolvable
 * @param {Guild} guild
 * @returns {Channel|null}
 */
const resolveChannel = (
    channelResolvable: string,
    guild: Guild
): GuildChannel =>
    guild.channels.find(
        (channel, id) =>
            id === channelResolvable || channel.name === channelResolvable
    );

export default resolveChannel;
