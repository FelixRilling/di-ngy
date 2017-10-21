"use strict";

/**
 * creates user+discrim from user
 *
 * @param {User} user
 * @returns {string}
 */
module.exports = user => `${user.username}#${user.discriminator}`;
