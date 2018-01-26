import { Guild, GuildChannel } from "discord.js";
import toFullName from "./toFullName";
import { resolve } from "path";

/**
 * resolves channel by id or name
 *
 * @param {string} channelResolvable
 * @param {Guild} guild
 * @returns {Channel|null}
 */
const resolveChannel = (channelResolvable: string, guild: Guild): GuildChannel =>
    guild.channels.find((channel, id) =>
        id === channelResolvable ||
        channel.name === channelResolvable
    );

export default resolveChannel;