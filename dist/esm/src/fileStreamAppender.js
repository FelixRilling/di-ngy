import { createWriteStream, ensureFile } from "fs-extra";
import { isObject } from "lightdash";
import { createDefaultLogPrefix } from "logby/src/appender/defaultLoggingAppender";
/**
 * helper method converting an array of arbitrary values to a string which can be logged.
 *
 * @private
 * @param args Arguments to stringify.
 * @returns String containing stringified arguments.
 */
const stringifyArgs = (args) => args.map(val => {
    if (isObject(val)) {
        return JSON.stringify(val);
    }
    return val;
}).join(" ");
/**
 * Logby appender streaming the output to a file on the disk.
 *
 * @private
 * @param path Path to use for the file, will be created if it does not exist.
 * @returns File stream appender.
 */
const createFileStreamAppender = async (path) => {
    await ensureFile(path);
    const writeStream = createWriteStream(path); //TODO find a way to properly close the stream on shutdown
    return (name, level, args) => {
        writeStream.write(`${createDefaultLogPrefix(name, level)} - ${stringifyArgs(args)}\n`);
    };
};
export { createFileStreamAppender };
//# sourceMappingURL=fileStreamAppender.js.map