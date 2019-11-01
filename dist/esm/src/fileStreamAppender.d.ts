import { AppenderFn } from "logby/dist/esm/src/appender/AppenderFn";
/**
 * Logby appender streaming the output to a file on the disk.
 *
 * @private
 * @param path Path to use for the file, will be created if it does not exist.
 * @returns File stream appender.
 */
declare const createFileStreamAppender: (path: string) => Promise<AppenderFn>;
export { createFileStreamAppender };
//# sourceMappingURL=fileStreamAppender.d.ts.map