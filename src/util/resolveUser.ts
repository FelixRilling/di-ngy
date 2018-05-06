import { Client, User } from "discord.js";

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

export default resolveUser;
