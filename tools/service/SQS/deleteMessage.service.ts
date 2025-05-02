import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class DeleteMessageService {
	/**
	 * Deletes a specified message from an SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to delete the message from
	 * @param receiptHandle The receipt handle of the message to delete
	 * @returns Promise with void if successful
	 */

	toolName = "delete-message";
	description = "Deletes a specified message from an SQS queue";

	deleteMessageInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z
			.string()
			.describe("The URL of the SQS queue to delete the message from"),
		receiptHandle: z
			.string()
			.describe(
				"The receipt handle of the message to delete (obtained from a `receive-message` call)",
			),
	};

	deleteMessageZodInput = z.object(this.deleteMessageInput);

	async deleteMessage({
		region,
		queueUrl,
		receiptHandle,
	}: {
		region: string;
		queueUrl: string;
		receiptHandle: string;
	}): Promise<void> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters
			const params = {
				QueueUrl: queueUrl,
				ReceiptHandle: receiptHandle,
			};

			const command = new DeleteMessageCommand(params);
			await sqsClient.send(command);

			return;
		} catch (error) {
			console.error(`Error deleting message from queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new DeleteMessageService();
