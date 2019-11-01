/**
 * IStorage implementation using a simple map to store data.
 *
 * @private
 */
class MemoryStorage {
    constructor() {
        this.data = new Map();
    }
    set(key, val) {
        this.data.set(key, val);
    }
    get(key) {
        return this.data.get(key);
    }
    has(key) {
        return this.data.has(key);
    }
}
export { MemoryStorage };
//# sourceMappingURL=MemoryStorage.js.map