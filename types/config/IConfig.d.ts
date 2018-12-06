import { IRole } from "../role/IRole";
interface IConfig {
    prefix: string;
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
}
export { IConfig };
