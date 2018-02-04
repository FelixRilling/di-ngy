import { Guild, GuildMember } from "discord.js";
import toFullName from "./toFullName";

/**
 * resolves member by id, username, name#discrim or name
 *
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

export default resolveMember;
