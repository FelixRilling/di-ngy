/**
 * @private
 */
declare class JSONStorage implements IStorage<any> {
    private static readonly logger;
    private readonly path;
    private data;
    constructor(path: string);
    init(): Promise<void>;
    save(key: string, val: any): void;
    load(key: string): any;
    has(key: string): boolean;
}
export { JSONStorage };
