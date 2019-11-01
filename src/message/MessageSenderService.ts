import { InjectableType } from "chevronjs";
import { Message, MessageOptions } from "discord.js";
import { isNil, isPromise, isString } from "lightdash";
import { dingyChevron, DingyDiKeys } from "../di";
import { Dingy } from "../Dingy";
import { dingyLogby } from "../logger";
import { CommandResponse } from "./response/CommandResponse";
import { Sendable } from "./response/Sendable";
import { Logger } from "logby";

/**
 * Handles sending messages.
 *
 * @private
 */
class MessageSenderService {
    private static readonly logger: Logger = dingyLogby.getLogger(
        MessageSenderService
    );
    private static readonly MAX_LENGTH = 2000;

    private readonly dingy: Dingy;

    public constructor(dingy: Dingy) {
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
        value: Sendable<string | CommandResponse>
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

    private send(msg: Message, value: string | CommandResponse): void {
        MessageSenderService.logger.trace("Preparing sending of message.", {
            value
        });
        const isPlainValue = isString(value);
        const options: MessageOptions = {
            code: isPlainValue ? false : (<CommandResponse>value).code,
            files: isPlainValue ? [] : (<CommandResponse>value).files
        };
        const content = this.determineContent(value, isPlainValue);

        MessageSenderService.logger.debug("Sending message.", {
            content,
            options
        });
        msg.channel
            .send(content, options)
            .then(sentMsg => {
                if (!isPlainValue && !isNil((<CommandResponse>value).onSend)) {
                    (<CommandResponse>value).onSend!(sentMsg);
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
        value: string | CommandResponse,
        isPlainValue: boolean
    ): string {
        const content: string = isPlainValue
            ? <string>value
            : (<CommandResponse>value).val;

        if (content.length > MessageSenderService.MAX_LENGTH) {
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

dingyChevron.set(
    InjectableType.FACTORY,
    [DingyDiKeys.CLASS],
    MessageSenderService
);

export { MessageSenderService };
