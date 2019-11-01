import { Role } from "../role/Role";
import { ClingyOptions } from "cli-ngy/dist/esm/src/ClingyOptions";
interface Config {
    prefix: string | RegExp;
    roles: Role[];
    enableDefaultCommands: boolean;
    answerToMissingCommand: boolean;
    answerToMissingArgs: boolean;
    answerToMissingPerms: boolean;
    strings: {
        error: {
            notFound: string;
            missingArgs: string;
            noPermission: string;
            invalidDMCall: string;
        };
        response: {
            empty: string;
            tooLong: string;
        };
        separator: string;
    };
    clingy: ClingyOptions;
}
export { Config };
//# sourceMappingURL=Config.d.ts.map