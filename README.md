# di-ngy

A small discord.js + cli-ngy boilerplate used by [lisa-bot](https://github.com/FelixRilling/lisa-bot).

## Usage

Create a basic bot instance:

```typescript
import { Dingy } from "di-ngy";

const commands = {
    ping: {
        alias: ["pong"],
        args: [],
        data: {
            powerRequired: 0,
            hidden: false,
            usableInDMs: true,
            help: "Ping!"
        },
        fn: (args, argsAll, msg, dingy, clingy) => "pong!"
    }
};
const config = {
    prefix: "$",
    enableDefaultCommands: true,
    answerToMissingCommand: false,
    answerToMissingArgs: true,
    answerToMissingPerms: true
};
const bot = new Dingy(commands, config);

bot.connect("yourDiscordApiToken")
    .then(() => console.log("Connected!"))
    .catch(e => console.error("An unexpected error occurred.", e));
```

## Optional Dependencies

Optional dependencies which can be installed:

- bufferutil
- erlpack

See <https://discord.js.org/#/docs/main/stable/general/welcome> for a list.
