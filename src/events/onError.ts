import { IDingy } from "../dingy";

const RECONNECT_TIMEOUT = 10000;

const onError = (err: Error, app: IDingy): void => {
    app.logger.warn(
        `Reconnect: Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`,
        err
    );
    app.bot.setTimeout(() => {
        app.connect();
    }, RECONNECT_TIMEOUT);
};

export { onError };
