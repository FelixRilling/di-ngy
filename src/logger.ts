import { clingyLogby } from "cli-ngy";
import { createDelegatingAppender, defaultLoggingAppender, Logby } from "logby";
import { createFileStreamAppender } from "./fileStreamAppender";

const logFilePath = `./log/bot_${Date.now()}.log`;

/**
 * Logby instance used by Di-ngy.
 *
 * @public
 */
const dingyLogby = new Logby();

createFileStreamAppender(logFilePath)
    .then(fileStreamAppender => dingyLogby.appenders.add(fileStreamAppender))
    // eslint-disable-next-line @typescript-eslint/unbound-method
    .catch(console.error);

clingyLogby.appenders.add(createDelegatingAppender(dingyLogby));
clingyLogby.appenders.delete(defaultLoggingAppender);

export { dingyLogby };
