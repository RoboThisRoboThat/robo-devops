import { SQSClient, ReceiveMessageCommand, Message } from "@aws-sdk/client-sqs";
import { z } from "zod";

class ReceiveMessageService {
	/**
	 * Retrieves one or more messages from a specified SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to receive messages from
	 * @param attributeNames Optional list of message attribute names to include
	 * @param messageAttributeNames Optional list of message attribute names to include
	 * @param maxNumberOfMessages Optional maximum number of messages to receive
	 * @param visibilityTimeout Optional duration for message invisibility
	 * @param waitTimeSeconds Optional duration for long polling
	 * @param receiveRequestAttemptId Optional identifier for the receive request
	 * @returns Promise containing the received messages
	 */

	toolName = "receive-message";
	description = "Retrieves one or more messages from a specified SQS queue";

	receiveMessageInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z
			.string()
			.describe("The URL of the SQS queue to receive messages from"),
		attributeNames: z
			.array(z.string())
			.optional()
			.describe(
				"A list of message attribute names to include in the received messages (e.g., `SenderId`, `SentTimestamp`, `ApproximateReceiveCount`). Use `All` to receive all standard attributes",
			),
		messageAttributeNames: z
			.array(z.string())
			.optional()
			.describe(
				"A list of message attribute names to include in the received messages (e.g., `Priority`, `Source`). Use `All` to receive all message attributes",
			),
		maxNumberOfMessages: z
			.number()
			.min(1)
			.max(10)
			.optional()
			.default(1)
			.describe("The maximum number of messages to receive"),
		visibilityTimeout: z
			.number()
			.optional()
			.describe(
				"The duration (in seconds) that the received messages are hidden from subsequent retrieve requests",
			),
		waitTimeSeconds: z
			.number()
			.min(0)
			.max(20)
			.optional()
			.default(0)
			.describe(
				"The duration (in seconds) for which the call waits for a message to arrive in the queue before returning. A non-zero value enables long polling",
			),
		receiveRequestAttemptId: z
			.string()
			.optional()
			.describe("A parameter that identifies the current receive request"),
	};

	receiveMessageZodInput = z.object(this.receiveMessageInput);

	async receiveMessage({
		region,
		queueUrl,
		attributeNames,
		messageAttributeNames,
		maxNumberOfMessages = 1,
		visibilityTimeout,
		waitTimeSeconds = 0,
		receiveRequestAttemptId,
	}: {
		region: string;
		queueUrl: string;
		attributeNames?: string[];
		messageAttributeNames?: string[];
		maxNumberOfMessages?: number;
		visibilityTimeout?: number;
		waitTimeSeconds?: number;
		receiveRequestAttemptId?: string;
	}): Promise<Message[]> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters
			const params: {
				QueueUrl: string;
				AttributeNames?: string[];
				MessageAttributeNames?: string[];
				MaxNumberOfMessages?: number;
				VisibilityTimeout?: number;
				WaitTimeSeconds?: number;
				ReceiveRequestAttemptId?: string;
			} = {
				QueueUrl: queueUrl,
			};

			if (attributeNames && attributeNames.length > 0) {
				params.AttributeNames = attributeNames;
			}

			if (messageAttributeNames && messageAttributeNames.length > 0) {
				params.MessageAttributeNames = messageAttributeNames;
			}

			if (maxNumberOfMessages > 1) {
				params.MaxNumberOfMessages = maxNumberOfMessages;
			}

			if (visibilityTimeout !== undefined) {
				params.VisibilityTimeout = visibilityTimeout;
			}

			if (waitTimeSeconds > 0) {
				params.WaitTimeSeconds = waitTimeSeconds;
			}

			if (receiveRequestAttemptId) {
				params.ReceiveRequestAttemptId = receiveRequestAttemptId;
			}

			const command = new ReceiveMessageCommand(params);
			const response = await sqsClient.send(command);

			return response.Messages || [];
		} catch (error) {
			console.error(`Error receiving messages from queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new ReceiveMessageService();
