declare class JSONStorage implements IStorage<any> {
    private data;
    private readonly path;
    private readonly logger;
    constructor(path: string);
    init(): Promise<void>;
    save(key: string, val: any): void;
    load(key: string): any;
    has(key: string): boolean;
}
export { JSONStorage };
