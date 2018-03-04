import { IDingy, IDingyCommandResolved } from "../../interfaces";
declare const resolveCommand: (str: string, msg: any, app: IDingy) => IDingyCommandResolved;
export default resolveCommand;
