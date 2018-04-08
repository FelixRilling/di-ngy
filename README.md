# di-ngy

A small discord.js + cli-ngy boilerplate used by [lisa-bot](https://github.com/FelixRilling/lisa-bot)

## Usage

Create a basic bot:

```js
const Dingy = require("di-ngy");

// new Dingy({config},{commands},{strings},{events});
const bot = new Dingy({
    token: "#botToken#", // Bot-token, should be secret! (Using ENV-vars to store this is recommended)
    prefix: "$", // Prefix to respond to: prefix:'foo' => responds to "foo help"
        options: {
        logLevel: "debug"
    },
    roles: [{
        name: "Admin",
        power: 10,
        assignable: false,
        check: (member) => ["#yourId#"].includes(member.user.id)
    }, {
        name: "User",
        power: 1,
        assignable: true,
        check: () => true
    }],
}, {
    foo: {
        fn: () => "bar",
        alias: [],
        args: [],
        help: {
            short: "First command",
            long: "My first command"
        }
    }
});

bot.connect();
```
