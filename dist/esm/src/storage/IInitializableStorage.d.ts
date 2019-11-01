import { IStorage } from "./IStorage";
interface IInitializableStorage<T> extends IStorage<T> {
    init(): Promise<void>;
}
export { IInitializableStorage };
//# sourceMappingURL=IInitializableStorage.d.ts.map