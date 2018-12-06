interface IStorage<T> {
    save(key: string, val: T): void;

    load(key: string): T;

    has(key: string): boolean;
}

export {IStorage}
