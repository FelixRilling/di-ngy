"use strict";

const _fetch = require("node-fetch");

/**
 * Loads an attachment and returns contents
 *
 * @param {MessageAttachment} attachment
 * @returns {Promise}
 */
module.exports = function (attachment) {
    return new Promise((resolve, reject) => {
        _fetch(attachment.url)
            .catch(reject)
            .then(response => {
                response
                    .text()
                    .then(text => {
                        resolve(text);
                    });
            });
    });
};
