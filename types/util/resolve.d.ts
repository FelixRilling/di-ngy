import { Client, Guild, GuildChannel, GuildMember, User } from "discord.js";
/**
 * resolves user by id
 *
 * @private
 * @param {string} userResolvable
 * @param {Guild} guild
 * @returns {Promise}
 */
declare const resolveUser: (userResolvable: string, bot: Client) => Promise<User>;
/**
 * resolves member by id, username, name#discriminator or name
 *
 * @private
 * @param {string} memberResolvable
 * @param {Guild} guild
 * @returns {Member|null}
 */
declare const resolveMember: (memberResolvable: string, guild: Guild) => GuildMember;
/**
 * resolves channel by id or name
 *
 * @private
 * @param {string} channelResolvable
 * @param {Guild} guild
 * @returns {Channel|null}
 */
declare const resolveChannel: (channelResolvable: string, guild: Guild) => GuildChannel;
export { resolveChannel, resolveMember, resolveUser };
