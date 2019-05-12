import { appenderFn } from "logby/types/appender/appenderFn";
/**
 * Logby appender streaming the output to a file on the disk.
 *
 * @public
 * @param path Path to use for the file, will be created if it does not exist.
 * @returns File stream appender.
 */
declare const createFileStreamAppender: (path: string) => Promise<appenderFn>;
export { createFileStreamAppender };
