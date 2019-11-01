import { InjectableType } from "chevronjs";
import { Client } from "discord.js";
import { isNil, objDefaultsDeep } from "lightdash";
import * as path from "path";
import { DEFAULT_CONFIG } from "./config/config.default";
import { dingyChevron, DingyDiKeys } from "./di";
import { dingyLogby } from "./logger";
import { createSlimMessage } from "./message/createSlimMessage";
import { MessageReceiverService } from "./message/MessageReceiverService";
import { JSONStorage } from "./storage/JSONStorage";
import { MemoryStorage } from "./storage/MemoryStorage";
/**
 * Main Dingy class.
 *
 * @public
 */
class Dingy {
    /**
     * Creates a new Dingy instance.
     *
     * @param {object} commands Object containing commands for the bot to use.
     * @param {object?} config Config object.
     * @param {object?} memoryStorage Storage instance handling runtime data. Falls back to {@link MemoryStorage}.
     * @param {object?} persistentStorage Storage instance handling persistent data; Falls back to {@link JSONStorage}.
     */
    constructor(commands, config = {}, memoryStorage, persistentStorage) {
        Dingy.logger.info("Creating instance.");
        Dingy.logger.debug("Applying config.");
        this.config = objDefaultsDeep(config, DEFAULT_CONFIG);
        Dingy.logger.info("Initializing Storage.");
        Dingy.logger.debug("Creating memory storage.");
        this.memoryStorage = isNil(memoryStorage)
            ? new MemoryStorage()
            : memoryStorage;
        Dingy.logger.debug("Creating persistent storage.");
        this.persistentStorage = isNil(persistentStorage)
            ? new JSONStorage(path.join("./", Dingy.DATA_DIRECTORY, "storage.json"))
            : persistentStorage;
        Dingy.logger.debug("Initializing DI.");
        dingyChevron.set(InjectableType.PLAIN, [], this, DingyDiKeys.CLASS);
        dingyChevron.set(InjectableType.PLAIN, [], commands, DingyDiKeys.COMMANDS);
        Dingy.logger.debug("Creating MessageReceiverService.");
        this.messageReceiverService = dingyChevron.get(MessageReceiverService);
        Dingy.logger.info("Creating Client.");
        this.client = new Client();
        Dingy.logger.debug("Binding events.");
        this.bindEvents();
        Dingy.logger.info("Created instance.");
    }
    /**
     * Connects the instance to the Discord API.
     *
     * @param {string} token API token.
     */
    async connect(token) {
        Dingy.logger.debug("Initializing persistent storage.");
        try {
            await this.persistentStorage.init();
        }
        catch (e) {
            const err = e;
            Dingy.logger.error("Could not init persistent storage: ", err);
            throw err;
        }
        Dingy.logger.info("Connecting to the Discord API.");
        try {
            await this.client.login(token);
        }
        catch (e) {
            const err = e;
            Dingy.logger.error("Could not connect to the Discord API.", err);
            throw err;
        }
        Dingy.logger.info("Connected.");
    }
    /**
     * Disconnects the instance from the Discord API.
     */
    async disconnect() {
        Dingy.logger.info("Disconnecting from the Discord API.");
        try {
            await this.client.destroy();
        }
        catch (e) {
            const err = e;
            Dingy.logger.error("Could not disconnect from the Discord API.", err);
            throw err;
        }
        Dingy.logger.info("Disconnected.");
    }
    bindEvents() {
        this.client.on("error", err => Dingy.logger.error("An error occurred, trying to continue.", err));
        this.client.on("message", msg => this.messageHandler(msg));
    }
    messageHandler(msg) {
        Dingy.logger.trace("A message was sent.", createSlimMessage(msg));
        this.messageReceiverService.handleMessage(msg);
    }
}
Dingy.logger = dingyLogby.getLogger(Dingy);
Dingy.DATA_DIRECTORY = "data";
export { Dingy };
//# sourceMappingURL=Dingy.js.map