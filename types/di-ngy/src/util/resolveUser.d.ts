import { Client, User } from "discord.js";
/**
 * resolves user by id
 *
 * @private
 * @param {string} userResolvable
 * @param {Guild} guild
 * @returns {Promise}
 */
declare const resolveUser: (userResolvable: string, bot: Client) => Promise<User>;
export { resolveUser };
