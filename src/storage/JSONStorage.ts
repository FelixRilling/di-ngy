import { pathExists, readJson, writeJson } from "fs-extra";
import { isNil } from "lightdash";
import { ILogger } from "logby";
import { dingyLoggerRoot } from "../loggerRoot";

class JSONStorage implements IStorage<any> {
    private data: { [key: string]: any };
    private readonly path: string;
    private readonly logger: ILogger;

    constructor(path: string) {
        this.data = {};
        this.path = path;
        this.logger = dingyLoggerRoot.getLogger(JSONStorage);
    }

    public async init(): Promise<void> {
        const exists = await pathExists(this.path);

        if (exists) {
            this.data = await readJson(this.path);
        } else {
            await writeJson(this.path, this.data);
        }
    }

    save(key: string, val: any): void {
        this.data[key] = val;
        // We don't need to wait for the saving to finish
        // this *could* lead to locking/access issues but hey, probably works.
        writeJson(this.path, this.data).catch(e =>
            this.logger.error("Could not save JSON", e)
        );
    }

    load(key: string): any {
        return this.data[key];
    }

    has(key: string): boolean {
        return !isNil(this.data[key]);
    }
}

export { JSONStorage };
