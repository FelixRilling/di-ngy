import { pathExists, readJson, writeJson } from "fs-extra";
import { isNil } from "lightdash";
import { dingyLogby } from "../logger";
import { InitializableStorage } from "./InitializableStorage";
import { Logger } from "logby";

const SAVE_INTERVAL_MS = 60 * 1000; // 1min

/**
 * IInitializableStorage implementation using JSON files to store data.
 *
 * @private
 */
class JSONStorage implements InitializableStorage<any> {
    private static readonly logger: Logger = dingyLogby.getLogger(JSONStorage);

    private readonly path: string;
    private data: { [key: string]: any };
    private dirty = false;
    private saveInterval: NodeJS.Timeout | null = null;

    public constructor(path: string) {
        this.data = {};
        this.path = path;
    }

    public async init(): Promise<void> {
        const exists = await pathExists(this.path);

        if (exists) {
            JSONStorage.logger.trace(`JSON '${this.path}' exists, loading it.`);
            this.data = await readJson(this.path);
        } else {
            JSONStorage.logger.trace(
                `JSON '${this.path}' does not exist, loading it.`
            );
            await writeJson(this.path, this.data);
        }

        this.saveInterval = setInterval(() => this.save(), SAVE_INTERVAL_MS);
    }

    public set(key: string, val: any): void {
        this.data[key] = val;
        this.dirty = true;
    }

    public get(key: string): any {
        return this.data[key];
    }

    public has(key: string): boolean {
        return !isNil(this.data[key]);
    }

    private save(): void {
        if (!this.dirty) {
            JSONStorage.logger.trace("JSON was not changed, not saving it.");
        } else {
            JSONStorage.logger.trace(
                "JSON was changed, attempting to save it."
            );
            this.dirty = false;
            // We don't need to wait for the saving to finish
            // This *could* lead to locking/access issues but hey, probably works.
            writeJson(this.path, this.data)
                .then(() =>
                    JSONStorage.logger.trace(`Saved JSON '${this.path}'.`)
                )
                .catch(e =>
                    JSONStorage.logger.error(
                        `Could not save JSON '${this.path}'.`,
                        e
                    )
                );
        }
    }
}

export { JSONStorage };
