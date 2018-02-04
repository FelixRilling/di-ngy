import { Client, User, UserResolvable } from "discord.js";

/**
 * resolves user by id
 *
 * @param {string} userResolveable
 * @param {Guild} guild
 * @returns {Promise}
 */
const resolveUser = (userResolveable: string, bot: Client): Promise<User> =>
    bot.fetchUser(userResolveable);

export default resolveUser;
