import { Client, User } from "discord.js";
/**
 * resolves user by id
 *
 * @param {string} userResolveable
 * @param {Guild} guild
 * @returns {Promise}
 */
declare const resolveUser: (userResolveable: string, bot: Client) => Promise<User>;
export default resolveUser;
