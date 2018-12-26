import { IRole } from "../role/IRole";
import { IClingyOptions } from "cli-ngy/types/IClingyOptions";
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
    clingy: IClingyOptions;
}
export { IConfig };
