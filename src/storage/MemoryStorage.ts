import { Storage } from "./Storage";

/**
 * IStorage implementation using a simple map to store data.
 *
 * @private
 */
class MemoryStorage implements Storage<any> {
    private readonly data: Map<string, any>;

    public constructor() {
        this.data = new Map<string, any>();
    }

    public set(key: string, val: any): void {
        this.data.set(key, val);
    }

    public get(key: string): any {
        return this.data.get(key);
    }

    public has(key: string): boolean {
        return this.data.has(key);
    }
}

export { MemoryStorage };
