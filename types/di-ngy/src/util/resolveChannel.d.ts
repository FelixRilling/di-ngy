import { Guild, GuildChannel } from "discord.js";
/**
 * resolves channel by id or name
 *
 * @private
 * @param {string} channelResolvable
 * @param {Guild} guild
 * @returns {Channel|null}
 */
declare const resolveChannel: (channelResolvable: string, guild: Guild) => GuildChannel;
export { resolveChannel };
