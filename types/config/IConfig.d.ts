import { IRole } from "../role/IRole";
interface IConfig {
    prefix: string;
    roles: IRole[];
    enableDefaultCommands: boolean;
    answerToMissingCommand: boolean;
    answerToMissingArgs: boolean;
    answerToMissingPerms: boolean;
}
export { IConfig };
