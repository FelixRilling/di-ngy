import { User } from "discord.js";

/**
 * creates user+discrim from user
 *
 * @param {User} user
 * @returns {string}
 */
const toFullName = (user: User): string =>
    `${user.username}#${user.discriminator}`;

export default toFullName;
