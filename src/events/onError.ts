import { IDingy } from "../interfaces";

const RECONNECT_TIMEOUT = 10000;

const onError = (err: Error, app: IDingy): void => {
    app.logger.warn(
        `Reconnect: Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`
    );
    app.bot.setTimeout(() => {
        app.connect();
    }, RECONNECT_TIMEOUT);
};

export { onError };
