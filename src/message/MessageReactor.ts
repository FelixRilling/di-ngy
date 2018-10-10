import { Clingy } from "cli-ngy";
import { ILookupErrorMissingArgs } from "cli-ngy/types/lookup/result/ILookupErrorMissingArgs";
import { ILookupErrorNotFound } from "cli-ngy/types/lookup/result/ILookupErrorNotFound";
import { ResultType } from "cli-ngy/types/lookup/result/ILookupResult";
import { ILookupSuccess } from "cli-ngy/types/lookup/result/ILookupSuccess";
import { Client, Message, MessageOptions } from "discord.js";
import { isPromise, isString } from "lightdash";
import { ILogger } from "logby";
import { IDingyCommand } from "../commands/IDingyCommand";
import { IConfig } from "../config/IConfig";
import { dingyLogby } from "../logger";
import { JSONStorage } from "../storage/JSONStorage";
import { MemoryStorage } from "../storage/MemoryStorage";
import { ICommandResponse } from "./response/ICommandResponse";
import { sendable } from "./response/sendable";

class MessageReactor {
    constructor(
        config: IConfig,
        client: Client,
        clingy: Clingy,
        memoryStorage: MemoryStorage,
        jsonStorage: JSONStorage
    ) {
        this.config = config;
        this.client = client;
        this.clingy = clingy;
        this.memoryStorage = memoryStorage;
        this.jsonStorage = jsonStorage;
    }

    private static readonly logger: ILogger = dingyLogby.getLogger(
        MessageReactor
    );

    private readonly config: IConfig;

    public readonly client: Client;
    public readonly clingy: Clingy;
    public readonly memoryStorage: MemoryStorage;
    public readonly jsonStorage: JSONStorage;

    public static createSlimMessage(msg: Message): object {
        return {
            author: { username: msg.author.username, id: msg.author.id },
            content: msg.content
        };
    }

    public handleMessage(msg: Message): void {
        MessageReactor.logger.debug(
            "Parsing content.",
            MessageReactor.createSlimMessage(msg)
        );
        const msgContent = msg.content.substr(this.config.prefix.length);
        const lookupResult = this.clingy.parse(msgContent);
        MessageReactor.logger.debug("Parsed content.", lookupResult);

        if (lookupResult.type === ResultType.ERROR_NOT_FOUND) {
            const lookupResultNotFound = <ILookupErrorNotFound>lookupResult;
            MessageReactor.logger.debug(
                `Command not found: ${lookupResultNotFound.missing}.`
            );
            this.handleLookupNotFound(msg, lookupResultNotFound);
        } else if (lookupResult.type === ResultType.ERROR_MISSING_ARGUMENT) {
            const lookupResultMissingArg = <ILookupErrorMissingArgs>(
                lookupResult
            );
            MessageReactor.logger.debug(
                `Argument missing: ${lookupResultMissingArg.missing}.`
            );
            this.handleLookupMissingArg(msg, lookupResultMissingArg);
        } else if (lookupResult.type === ResultType.SUCCESS) {
            const lookupResultSuccess = <ILookupSuccess>lookupResult;
            MessageReactor.logger.info(
                "Lookup successful.",
                lookupResultSuccess
            );
            this.handleLookupSuccess(msg, lookupResultSuccess);
        } else {
            MessageReactor.logger.error(
                "Every check failed, this should never happen.",
                lookupResult
            );
        }
    }

    private handleLookupNotFound(
        msg: Message,
        lookupResultNotFound: ILookupErrorNotFound
    ): void {
        if (this.config.answerToMissingCommand) {
            MessageReactor.logger.debug("Answering to command not found.");
            this.sendResult(
                msg,
                this.config.strings.error.notFound +
                    lookupResultNotFound.missing
            );
        }
    }

    private handleLookupMissingArg(
        msg: Message,
        lookupResultMissingArg: ILookupErrorMissingArgs
    ): void {
        if (this.config.answerToMissingArgs) {
            MessageReactor.logger.debug("Answering to missing arg.");
            this.sendResult(
                msg,
                this.config.strings.error.missingArgs +
                    lookupResultMissingArg.missing.map(arg => arg.name)
            );
        }
    }

    private handleLookupSuccess(
        msg: Message,
        lookupResultSuccess: ILookupSuccess
    ): void {
        const command = <IDingyCommand>lookupResultSuccess.command;

        if (this.hasPermissions(msg, <IDingyCommand>command)) {
            MessageReactor.logger.debug("Running command:", command);
            const result = command.fn(lookupResultSuccess.args, msg, this);
            MessageReactor.logger.debug("Command returned:", result);
            if (result != null) {
                MessageReactor.logger.debug("Answering to successful command.");
                this.sendResult(msg, result);
            } else {
                MessageReactor.logger.debug("Skipping response.");
            }
        } else {
            MessageReactor.logger.debug("No permissions.");
            this.sendResult(msg, this.config.strings.error.noPermission);
        }
    }

    private sendResult(
        msg: Message,
        value: sendable<string | ICommandResponse>
    ): void {
        if (isPromise(value)) {
            MessageReactor.logger.debug("Value is a promise, waiting.");
            value
                .then(valueResolved => this.send(msg, valueResolved))
                .catch(err =>
                    MessageReactor.logger.error(
                        "Error while waiting for resolve: ",
                        err
                    )
                );
        } else {
            this.send(msg, value);
        }
    }

    private send(msg: Message, value: string | ICommandResponse): void {
        MessageReactor.logger.debug("Sending message.", value);
        const isPlainValue = isString(value);
        const content = isPlainValue ? value : (<ICommandResponse>value).val;
        const options: MessageOptions = {
            code: isPlainValue ? false : (<ICommandResponse>value).code,
            files: isPlainValue ? [] : (<ICommandResponse>value).files
        };
        msg.channel
            .send(content, options)
            .then(() =>
                MessageReactor.logger.debug("Sent message.", content, options)
            )
            .catch(err =>
                MessageReactor.logger.error("Could not send message.", err)
            );
    }

    private hasPermissions(msg: Message, command: IDingyCommand): boolean {
        let maxPower = 0;

        this.config.roles.forEach(role => {
            if (role.power > maxPower && role.check(msg)) {
                maxPower = role.power;
            }
        });

        return maxPower >= command.data.powerRequired;
    }
}

export { MessageReactor };
