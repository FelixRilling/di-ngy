import { clingyLogby } from "cli-ngy";
import { Levels } from "logby";
import { Dingy } from "src/Dingy";
import { dingyLogby } from "src/logger";

describe("Dingy", () => {
    beforeAll(() => {
        clingyLogby.setLevel(Levels.TRACE);
        dingyLogby.setLevel(Levels.TRACE);
    });

    it("constructs", () => {
        const dingy = new Dingy();
        expect(dingy).toBeDefined();
    });
});
