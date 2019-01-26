import { User } from "discord.js";

// noinspection JSUnusedGlobalSymbols
/**
 * Creates a displayable string of an user.
 *
 * @private
 * @param {User} user
 * @returns {string}
 */
const toFullName = (user: User): string =>
    `${user.username}#${user.discriminator}`;

// noinspection JSUnusedGlobalSymbols
export { toFullName };
