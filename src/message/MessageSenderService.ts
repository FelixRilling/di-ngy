import { Message, MessageOptions } from "discord.js";
import { isNil, isPromise, isString } from "lightdash";
import { ILogger } from "logby";
import { Dingy } from "../Dingy";
import { dingyLogby } from "../logger";
import { ICommandResponse } from "./response/ICommandResponse";
import { sendable } from "./response/sendable";

const MAX_LENGTH = 2000;

/**
 * Handles sending messages.
 *
 * @private
 */
class MessageSenderService {
    private static readonly logger: ILogger = dingyLogby.getLogger(
        MessageSenderService
    );

    private readonly dingy: Dingy;

    constructor(dingy: Dingy) {
        this.dingy = dingy;
    }

    /**
     * Sends a result as response.
     *
     * @param msg Message to respond to.
     * @param value Value to send.
     */
    public sendResult(
        msg: Message,
        value: sendable<string | ICommandResponse>
    ): void {
        if (isPromise(value)) {
            MessageSenderService.logger.debug("Value is a promise, waiting.");
            value
                .then(valueResolved => this.send(msg, valueResolved))
                .catch(err =>
                    MessageSenderService.logger.error(
                        "Error while waiting for resolve: ",
                        err
                    )
                );
        } else {
            this.send(msg, value);
        }
    }

    private send(msg: Message, value: string | ICommandResponse): void {
        MessageSenderService.logger.trace("Preparing sending of message.", {
            value
        });
        const isPlainValue = isString(value);
        const options: MessageOptions = {
            code: isPlainValue ? false : (<ICommandResponse>value).code,
            files: isPlainValue ? [] : (<ICommandResponse>value).files
        };
        const content = this.determineContent(value, isPlainValue);

        MessageSenderService.logger.debug("Sending message.", {
            content,
            options
        });
        msg.channel
            .send(content, options)
            .then(sentMsg => {
                if (!isPlainValue && !isNil((<ICommandResponse>value).onSend)) {
                    (<ICommandResponse>value).onSend!(sentMsg);
                }
                MessageSenderService.logger.debug("Sent message.", {
                    content,
                    options
                });
            })
            .catch(err =>
                MessageSenderService.logger.error(
                    "Could not send message.",
                    err
                )
            );
    }

    private determineContent(
        value: string | ICommandResponse,
        isPlainValue: boolean
    ) {
        let content: string = isPlainValue
            ? <string>value
            : (<ICommandResponse>value).val;

        if (content.length > MAX_LENGTH) {
            MessageSenderService.logger.warn(
                "Message is too long to send:",
                content
            );
            return this.dingy.config.strings.response.tooLong;
        }
        if (content.length === 0) {
            MessageSenderService.logger.warn("Message is empty.");
            return this.dingy.config.strings.response.empty;
        }

        return content;
    }
}

export { MessageSenderService };
