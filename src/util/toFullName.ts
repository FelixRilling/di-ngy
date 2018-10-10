import { User } from "discord.js";

/**
 * creates user+discriminator from user
 *
 * @private
 * @param {User} user
 * @returns {string}
 */
const toFullName = (user: User): string =>
    `${user.username}#${user.discriminator}`;

export { toFullName };
