import { User } from "discord.js";
/**
 * creates user+discrim from user
 *
 * @param {User} user
 * @returns {string}
 */
declare const toFullName: (user: User) => string;
export default toFullName;
