"use strict";

const nodeFetch = require("make-fetch-happen").defaults({
    cacheManager: "./.cache/"
});

/**
 * Loads an attachment and returns contents
 *
 * @param {MessageAttachment} attachment
 * @returns {Promise}
 */
module.exports = (attachment) => new Promise((resolve, reject) => {
    nodeFetch(attachment.url)
        .then(response => {
            response
                .text()
                .then(text => {
                    resolve(text);
                });
        })
        .catch(reject);
});
