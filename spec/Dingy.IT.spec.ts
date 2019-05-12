import { Levels } from "logby";
import { Dingy } from "src/Dingy";
import { dingyLogby } from "src/logger";

describe("Dingy", () => {
    beforeAll(() => {
        dingyLogby.level = Levels.TRACE;
    });

    it("constructs", () => {
        const dingy = new Dingy({});
        expect(dingy).toBeDefined();
    });
});
