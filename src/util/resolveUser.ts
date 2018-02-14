import { Client, User, UserResolvable } from "discord.js";

/**
 * resolves user by id
 *
 * @param {string} userResolvable
 * @param {Guild} guild
 * @returns {Promise}
 */
const resolveUser = (userResolvable: string, bot: Client): Promise<User> =>
    bot.fetchUser(userResolvable);

export default resolveUser;
