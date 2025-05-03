import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";
import BaseService from "../base.service";

class SendMessageService {
	/**
	 * Sends a message to a specified SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to send the message to
	 * @param messageBody The content of the message to send
	 * @param delaySeconds Optional delay for message delivery
	 * @param messageAttributes Optional message attributes
	 * @param messageSystemAttributes Optional message system attributes
	 * @param messageDeduplicationId Optional token for deduplication
	 * @param messageGroupId Optional tag for message group
	 * @returns Promise containing the message ID
	 */

	toolName = "send-message";
	description = "Sends a message to a specified SQS queue";

	sendMessageInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z
			.string()
			.describe("The URL of the SQS queue to send the message to"),
		messageBody: z
			.string()
			.describe("The content of the message to send (a string)"),
		delaySeconds: z
			.number()
			.min(0)
			.max(900)
			.optional()
			.default(0)
			.describe(
				"The number of seconds (0 to 900) to delay the delivery of the message",
			),
		messageAttributes: z
			.string()
			.optional()
			.describe(
				"A JSON string or a path to a JSON file specifying message attributes",
			),
		messageSystemAttributes: z
			.string()
			.optional()
			.describe(
				"A JSON string or a path to a JSON file specifying message system attributes",
			),
		messageDeduplicationId: z
			.string()
			.optional()
			.describe(
				"The token used for deduplication of sent messages. Required when using FIFO queues",
			),
		messageGroupId: z
			.string()
			.optional()
			.describe(
				"The tag that specifies that a message belongs to a specific message group. Required when using FIFO queues",
			),
	};

	sendMessageZodInput = z.object(this.sendMessageInput);

	async sendMessage({
		region,
		queueUrl,
		messageBody,
		delaySeconds = 0,
		messageAttributes,
		messageSystemAttributes,
		messageDeduplicationId,
		messageGroupId,
	}: {
		region: string;
		queueUrl: string;
		messageBody: string;
		delaySeconds?: number;
		messageAttributes?: string;
		messageSystemAttributes?: string;
		messageDeduplicationId?: string;
		messageGroupId?: string;
	}): Promise<string> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Parse message attributes if provided
			let parsedMessageAttributes: Record<string, any> = {};
			if (messageAttributes) {
				try {
					parsedMessageAttributes = JSON.parse(messageAttributes);
				} catch (error) {
					throw new Error(`Failed to parse message attributes JSON: ${error}`);
				}
			}

			// Parse message system attributes if provided
			let parsedMessageSystemAttributes: Record<string, any> = {};
			if (messageSystemAttributes) {
				try {
					parsedMessageSystemAttributes = JSON.parse(messageSystemAttributes);
				} catch (error) {
					throw new Error(
						`Failed to parse message system attributes JSON: ${error}`,
					);
				}
			}

			// Prepare command parameters
			const params: {
				QueueUrl: string;
				MessageBody: string;
				DelaySeconds?: number;
				MessageAttributes?: Record<string, any>;
				MessageSystemAttributes?: Record<string, any>;
				MessageDeduplicationId?: string;
				MessageGroupId?: string;
			} = {
				QueueUrl: queueUrl,
				MessageBody: messageBody,
			};

			if (delaySeconds > 0) {
				params.DelaySeconds = delaySeconds;
			}

			if (Object.keys(parsedMessageAttributes).length > 0) {
				params.MessageAttributes = parsedMessageAttributes;
			}

			if (Object.keys(parsedMessageSystemAttributes).length > 0) {
				params.MessageSystemAttributes = parsedMessageSystemAttributes;
			}

			if (messageDeduplicationId) {
				params.MessageDeduplicationId = messageDeduplicationId;
			}

			if (messageGroupId) {
				params.MessageGroupId = messageGroupId;
			}

			const command = new SendMessageCommand(params);
			const response = await sqsClient.send(command);

			if (!response.MessageId) {
				throw new Error("Failed to send message: MessageId not returned");
			}

			return response.MessageId;
		} catch (error) {
			console.error(`Error sending message to queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

const sendMessageService = new SendMessageService();

export default new BaseService(
	sendMessageService.toolName,
	sendMessageService.description,
	sendMessageService.sendMessageInput,
	sendMessageService.sendMessageZodInput,
	sendMessageService.sendMessage,
);
