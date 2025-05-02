import { SQSClient, DeleteQueueCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class DeleteQueueService {
	/**
	 * Deletes a specified SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to delete
	 * @returns Promise with void if successful
	 */

	toolName = "delete-queue";
	description = "Deletes a specified SQS queue";

	deleteQueueInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z.string().describe("The URL of the SQS queue to delete"),
	};

	deleteQueueZodInput = z.object(this.deleteQueueInput);

	async deleteQueue({
		region,
		queueUrl,
	}: {
		region: string;
		queueUrl: string;
	}): Promise<void> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters
			const params = {
				QueueUrl: queueUrl,
			};

			const command = new DeleteQueueCommand(params);
			await sqsClient.send(command);

			return;
		} catch (error) {
			console.error(`Error deleting queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new DeleteQueueService();
