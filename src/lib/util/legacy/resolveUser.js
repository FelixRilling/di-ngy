"use strict";

/**
 * resolves user by id
 *
 * @param {string} userResolveable
 * @param {Guild} guild
 * @returns {Promise}
 */
module.exports = (userResolveable, bot) => bot.fetchUser(userResolveable);
