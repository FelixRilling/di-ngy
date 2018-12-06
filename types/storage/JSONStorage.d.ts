import { IStorage } from "./IStorage";
/**
 * @private
 */
declare class JSONStorage implements IStorage<any> {
    private static readonly logger;
    private readonly path;
    private data;
    private dirty;
    private saveInterval;
    constructor(path: string);
    init(): Promise<void>;
    set(key: string, val: any): void;
    get(key: string): any;
    has(key: string): boolean;
    private save;
}
export { JSONStorage };
