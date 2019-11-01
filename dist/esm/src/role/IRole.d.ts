import { Message } from "discord.js";
interface IRole {
    power: number;
    check: (msg: Message) => boolean;
}
export { IRole };
//# sourceMappingURL=IRole.d.ts.map