import { IRole } from "../role/IRole";
import { ClingyOptions } from "cli-ngy/dist/esm/src/ClingyOptions";
interface IConfig {
    prefix: string | RegExp;
    roles: IRole[];
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
export { IConfig };
//# sourceMappingURL=IConfig.d.ts.map