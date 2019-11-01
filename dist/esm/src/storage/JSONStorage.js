import { pathExists, readJson, writeJson } from "fs-extra";
import { isNil } from "lightdash";
import { dingyLogby } from "../logger";
const SAVE_INTERVAL_MS = 60 * 1000; // 1min
/**
 * IInitializableStorage implementation using JSON files to store data.
 *
 * @private
 */
class JSONStorage {
    constructor(path) {
        this.dirty = false;
        this.saveInterval = null;
        this.data = {};
        this.path = path;
    }
    async init() {
        const exists = await pathExists(this.path);
        if (exists) {
            JSONStorage.logger.trace(`JSON '${this.path}' exists, loading it.`);
            this.data = await readJson(this.path);
        }
        else {
            JSONStorage.logger.trace(`JSON '${this.path}' does not exist, loading it.`);
            await writeJson(this.path, this.data);
        }
        this.saveInterval = setInterval(() => this.save(), SAVE_INTERVAL_MS);
    }
    set(key, val) {
        this.data[key] = val;
        this.dirty = true;
    }
    get(key) {
        return this.data[key];
    }
    has(key) {
        return !isNil(this.data[key]);
    }
    save() {
        if (!this.dirty) {
            JSONStorage.logger.trace("JSON was not changed, not saving it.");
        }
        else {
            JSONStorage.logger.trace("JSON was changed, attempting to save it.");
            this.dirty = false;
            // We don't need to wait for the saving to finish
            // This *could* lead to locking/access issues but hey, probably works.
            writeJson(this.path, this.data)
                .then(() => JSONStorage.logger.trace(`Saved JSON '${this.path}'.`))
                .catch(e => JSONStorage.logger.error(`Could not save JSON '${this.path}'.`, e));
        }
    }
}
JSONStorage.logger = dingyLogby.getLogger(JSONStorage);
export { JSONStorage };
//# sourceMappingURL=JSONStorage.js.map