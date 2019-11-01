import { Storage } from "./Storage";
interface InitializableStorage<T> extends Storage<T> {
    init(): Promise<void>;
}
export { InitializableStorage };
//# sourceMappingURL=InitializableStorage.d.ts.map