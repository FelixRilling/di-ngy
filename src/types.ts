type commandFn = (args: any, msg: any, app: any) => commandResult;

type commandResult = string | [string, boolean | string, string[]];

export { commandFn, commandResult };
