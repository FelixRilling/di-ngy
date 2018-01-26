import { Guild, GuildMember } from "discord.js";
/**
 * resolves member by id, username, name#discrim or name
 *
 * @param {string} memberResolvable
 * @param {Guild} guild
 * @returns {Member|null}
 */
declare const resolveMember: (memberResolvable: string, guild: Guild) => GuildMember;
export default resolveMember;
