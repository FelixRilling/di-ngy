"use strict";

const nodeFetch = require("node-fetch");

/**
 * Loads an attachment and returns contents
 *
 * @param {MessageAttachment} attachment
 * @returns {Promise}
 */
module.exports = function (attachment) {
    return new Promise((resolve, reject) => {
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
};
