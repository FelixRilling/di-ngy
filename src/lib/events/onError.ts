import { IDingy } from "../../interfaces";

const RECONNECT_TIMEOUT = 10000;

/**
 * onError event
 *
 * @param {Error} err
 * @param {Dingy} app
 */
const onError = (err: Error, app: IDingy): void => {
    app.log.error(
        "Reconnect",
        `Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`
    );
    app.bot.setTimeout(() => {
        app.connect();
    }, RECONNECT_TIMEOUT);
};

export default onError;
