import { Message } from "discord.js";
interface Role {
    power: number;
    check: (msg: Message) => boolean;
}
export { Role };
//# sourceMappingURL=Role.d.ts.map