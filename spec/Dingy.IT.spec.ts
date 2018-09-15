import { Dingy } from "../src/Dingy";
import { dingyLoggerRoot } from "../src/loggerRoot";
import { Level } from "logby";

describe("Dingy", () => {

    beforeAll(() => {
        dingyLoggerRoot.level = Level.DEBUG;
    });

    it("constructs", () => {
        const dingy = new Dingy();
        expect(dingy).toBeDefined();
    });
});
