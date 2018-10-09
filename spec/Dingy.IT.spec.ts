import { Dingy } from "src/Dingy";
import { dingyLogby } from "src/logger";
import { Levels } from "logby";
import { clingyLogby } from "cli-ngy";

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
