import { Clingy } from "cli-ngy";
import { ILookupErrorMissingArgs } from "cli-ngy/types/lookup/result/ILookupErrorMissingArgs";
import { ILookupErrorNotFound } from "cli-ngy/types/lookup/result/ILookupErrorNotFound";
import { ResultType } from "cli-ngy/types/lookup/result/ILookupResult";
import { ILookupSuccess } from "cli-ngy/types/lookup/result/ILookupSuccess";
import { Client, Message } from "discord.js";
import { ILogger } from "logby";
import { IConfig } from "../config/IConfig";
import { dingyLogby } from "../logger";
import { JSONStorage } from "../storage/JSONStorage";
import { MemoryStorage } from "../storage/MemoryStorage";

class MessageReactor {
    private static readonly logger: ILogger = dingyLogby.getLogger(
        MessageReactor
    );

    private readonly config: IConfig;

    public readonly client: Client;
    public readonly clingy: Clingy;
    public readonly memoryStorage: MemoryStorage;
    public readonly jsonStorage: JSONStorage;

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

    public handleMessage(msg: Message): void {
        MessageReactor.logger.debug("Parsing content", msg);
        const lookupResult = this.clingy.parse(msg.content);
        MessageReactor.logger.debug("Parsed content", lookupResult);

        if (lookupResult.type === ResultType.ERROR_NOT_FOUND) {
            const lookupResultNotFound = <ILookupErrorNotFound>lookupResult;
            MessageReactor.logger.debug(
                `Command not found: ${lookupResultNotFound.missing}`
            );
            this.handleNotFound(msg, lookupResultNotFound);
        } else if (lookupResult.type === ResultType.ERROR_MISSING_ARGUMENT) {
            const lookupResultMissingArg = <ILookupErrorMissingArgs>(
                lookupResult
            );
            MessageReactor.logger.debug(
                `Argument missing: ${lookupResultMissingArg.missing}`
            );
            this.handleMissingArg(msg, lookupResultMissingArg);
        } else if (lookupResult.type === ResultType.SUCCESS) {
            const lookupResultSuccess = <ILookupSuccess>lookupResult;
            MessageReactor.logger.info(
                "Lookup successful",
                lookupResultSuccess
            );
            this.handleSuccess(msg, lookupResultSuccess);
        } else {
            MessageReactor.logger.error(
                "Every check failed, this should never happen",
                lookupResult
            );
        }
    }

    private handleNotFound(
        msg: Message,
        lookupResultNotFound: ILookupErrorNotFound
    ): void {
        if (this.config.answerToMissingCommand) {
            MessageReactor.logger.debug("Answering to command not found.");
            this.send(msg, "not found");
        }
    }

    private handleMissingArg(
        msg: Message,
        lookupResultMissingArg: ILookupErrorMissingArgs
    ): void {
        if (this.config.answerToMissingArgs) {
            MessageReactor.logger.debug("Answering to missing arg.");
            this.send(msg, "missing arg");
        }
    }

    private handleSuccess(
        msg: Message,
        lookupResultSuccess: ILookupSuccess
    ): void {
        MessageReactor.logger.debug("Answering to successful command.");
        this.send(msg, "ok");
    }

    private send(msg: Message, value: string) {
        MessageReactor.logger.debug("Sending message.", value);
        msg.channel
            .send(value)
            .then(() => MessageReactor.logger.debug("Sent message."))
            .catch(err =>
                MessageReactor.logger.error("Could not send message", err)
            );
    }
}

export { MessageReactor };
