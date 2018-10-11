import { pathExists, readJson, writeJson } from "fs-extra";
import { isNil } from "lightdash";
import { ILogger } from "logby";
import { dingyLogby } from "../logger";

/**
 * @private
 */
class JSONStorage implements IStorage<any> {
    private static readonly logger: ILogger = dingyLogby.getLogger(JSONStorage);

    private readonly path: string;
    private data: { [key: string]: any };

    constructor(path: string) {
        this.data = {};
        this.path = path;
    }

    public async init(): Promise<void> {
        const exists = await pathExists(this.path);

        if (exists) {
            this.data = await readJson(this.path);
        } else {
            await writeJson(this.path, this.data);
        }
    }

    public save(key: string, val: any): void {
        this.data[key] = val;
        // We don't need to wait for the saving to finish
        // this *could* lead to locking/access issues but hey, probably works.
        writeJson(this.path, this.data).catch(e =>
            JSONStorage.logger.error("Could not save JSON", e)
        );
    }

    public load(key: string): any {
        return this.data[key];
    }

    public has(key: string): boolean {
        return !isNil(this.data[key]);
    }
}

export { JSONStorage };
