import { Storage } from "./Storage";
/**
 * IStorage implementation using a simple map to store data.
 *
 * @private
 */
declare class MemoryStorage implements Storage<any> {
    private readonly data;
    constructor();
    set(key: string, val: any): void;
    get(key: string): any;
    has(key: string): boolean;
}
export { MemoryStorage };
//# sourceMappingURL=MemoryStorage.d.ts.map