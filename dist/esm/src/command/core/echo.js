/**
 * Built-in "echo" command.
 *
 * @private
 */
const echo = {
    alias: ["say", "send"],
    args: [
        {
            name: "val",
            required: true
        }
    ],
    sub: null,
    data: {
        powerRequired: 8,
        hidden: true,
        usableInDMs: true,
        help: "Echoes a text."
    },
    fn: (args) => args.get("val")
};
export { echo };
//# sourceMappingURL=echo.js.map