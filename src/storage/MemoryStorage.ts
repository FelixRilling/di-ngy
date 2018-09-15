class MemoryStorage implements IStorage<any> {
    private readonly data: Map<string, any>;

    constructor() {
        this.data = new Map<string, any>();
    }

    save(key: string, val: any): void {
        this.data.set(key, val);
    }

    load(key: string): any {
        return this.data.get(key);
    }

    has(key: string): boolean {
        return this.data.has(key);
    }
}

export { MemoryStorage };
