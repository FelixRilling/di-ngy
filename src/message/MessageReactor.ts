import { Clingy } from "cli-ngy";
import { ILookupErrorMissingArgs } from "cli-ngy/types/lookup/result/ILookupErrorMissingArgs";
import { ILookupErrorNotFound } from "cli-ngy/types/lookup/result/ILookupErrorNotFound";
import { ResultType } from "cli-ngy/types/lookup/result/ILookupResult";
import { ILookupSuccess } from "cli-ngy/types/lookup/result/ILookupSuccess";
import { Client, DMChannel, Message, MessageOptions } from "discord.js";
import { isInstanceOf, isPromise, isString } from "lightdash";
import { ILogger } from "logby";
import { IDingyCommand } from "../commands/IDingyCommand";
import { IConfig } from "../config/IConfig";
import { dingyLogby } from "../logger";
import { JSONStorage } from "../storage/JSONStorage";
import { MemoryStorage } from "../storage/MemoryStorage";
import { ICommandResponse } from "./response/ICommandResponse";
import { sendable } from "./response/sendable";
import { hasEnoughPower } from "../role/hasEnoughPower";

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

    private static readonly MAX_LENGTH = 2000;

    private readonly config: IConfig;
    private readonly client: Client;
    private readonly clingy: Clingy;
    private readonly memoryStorage: MemoryStorage;
    private readonly jsonStorage: JSONStorage;

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

        if (isInstanceOf(msg.channel, DMChannel) && !command.data.usableInDMs) {
            MessageReactor.logger.debug("Not usable in DMs.");
            this.sendResult(msg, this.config.strings.error.invalidDMCall);
            return;
        }

        if (!hasEnoughPower(msg, command.data.powerRequired, this.config.roles)) {
            MessageReactor.logger.debug("No permissions.");
            this.sendResult(msg, this.config.strings.error.noPermission);
            return;
        }

        MessageReactor.logger.debug("Running command:", command);
        const result = command.fn(lookupResultSuccess.args, msg, this);
        MessageReactor.logger.debug("Command returned:", result);

        if (result == null) {
            MessageReactor.logger.debug("Skipping response.");
            return;
        }

        MessageReactor.logger.debug("Answering to successful command.");
        this.sendResult(msg, result);
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
        const options: MessageOptions = {
            code: isPlainValue ? false : (<ICommandResponse>value).code,
            files: isPlainValue ? [] : (<ICommandResponse>value).files
        };
        let content: string = isPlainValue ? <string>value : (<ICommandResponse>value).val;

        if (content.length > MessageReactor.MAX_LENGTH) {
            MessageReactor.logger.warn("Message is too long to send:", content);
            content = this.config.strings.response.tooLong;
        } else if (content.length === 0) {
            MessageReactor.logger.warn("Message is empty.");
            content = this.config.strings.response.empty;
        }

        msg.channel
            .send(content, options)
            .then(() =>
                MessageReactor.logger.debug("Sent message.", content, options)
            )
            .catch(err =>
                MessageReactor.logger.error("Could not send message.", err)
            );
    }
}

export { MessageReactor };
