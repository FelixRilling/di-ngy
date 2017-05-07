"use strict";

const MAX_SIZE_MESSAGE = 2000;
const MAX_SIZE_FILE = 6.4e+7;

const isEmpty = str => str.length === 0;
const isTooBigForMsg = str => str.length > MAX_SIZE_MESSAGE;
const isTooBigForFile = str => str.length > MAX_SIZE_FILE;

const send = function (app, msg, text, code, files) {
    msg
        .channel
        .send(String(text), {
            code,
            files
        })
        .then(() => app.log.info("SentMsg"))
        .catch(() => app.log.warning("SentMsgError"));
};

module.exports = function (app, msg, data) {
    const text = data[0];
    const code = data[1] || false;
    const files = data[2] || [];

    if (isEmpty(text)) {
        app.log.notice("Empty");
        send(app, msg, app.strings.infoEmpty, "error", []);

        return false;
    } else if (isTooBigForMsg(text)) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = {
                name: "output.txt",
                attachment: Buffer.from(text)
            };

            app.log.notice("TooLong", true);
            send(app, msg, app.strings.infoTooLong, "error", [outputFile]);
        } else {
            app.log.notice("TooLong", false);
            send(app, msg, app.strings.errorTooLong, "error", []);
        }
    } else {
        app.log.info("Sending");
        send(app, msg, text, code, files);
    }
};