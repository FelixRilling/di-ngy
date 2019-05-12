import { IStorage } from "./IStorage";
/**
 * IStorage implementation using a simple map to store data.
 *
 * @private
 */
declare class MemoryStorage implements IStorage<any> {
    private readonly data;
    constructor();
    set(key: string, val: any): void;
    get(key: string): any;
    has(key: string): boolean;
}
export { MemoryStorage };
