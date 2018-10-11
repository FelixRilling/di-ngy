/**
 * @private
 */
declare class MemoryStorage implements IStorage<any> {
    private readonly data;
    constructor();
    save(key: string, val: any): void;
    load(key: string): any;
    has(key: string): boolean;
}
export { MemoryStorage };
