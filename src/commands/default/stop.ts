import { IDingyCommand } from "../IDingyCommand";

const EXIT_CODE_STOP = 10;

const stop: IDingyCommand = {
    alias: ["die", "shutdown"],
    args: [],
    sub: null,
    data: {
        powerRequired: 10,
        hidden: true,
        usableInDMs: true,
        help: "Stops the bot."
    },
    fn: (args, msg, dingy) => {
        dingy.client.setTimeout(async () => {
            await dingy.disconnect();
            process.exit(EXIT_CODE_STOP);
        }, 1000);

        return "Stopping...";
    }
};

export { stop };
