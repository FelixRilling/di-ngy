import { Client, Guild, GuildChannel, GuildMember, User } from "discord.js";
import { toFullName } from "./toFullName";

/**
 * resolves user by id
 *
 * @private
 * @param {string} userResolvable
 * @param {Guild} guild
 * @returns {Promise}
 */
const resolveUser = (userResolvable: string, bot: Client): Promise<User> =>
    bot.fetchUser(userResolvable);

/**
 * resolves member by id, username, name#discriminator or name
 *
 * @private
 * @param {string} memberResolvable
 * @param {Guild} guild
 * @returns {Member|null}
 */
const resolveMember = (memberResolvable: string, guild: Guild): GuildMember =>
    guild.members.find(
        (member, id) =>
            id === memberResolvable ||
            toFullName(member.user) === memberResolvable ||
            member.user.username === memberResolvable ||
            member.nickname === memberResolvable
    );
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

export { resolveChannel, resolveMember, resolveUser };
