interface IStorage<T> {
    set(key: string, val: T): void;
    get(key: string): T;
    has(key: string): boolean;
}
export { IStorage };
