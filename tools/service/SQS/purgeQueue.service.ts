import { SQSClient, PurgeQueueCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class PurgeQueueService {
	/**
	 * Deletes all messages from a specified SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to purge
	 * @returns Promise with void if successful
	 */

	toolName = "purge-queue";
	description = "Deletes all messages from a specified SQS queue";

	purgeQueueInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z.string().describe("The URL of the SQS queue to purge"),
	};

	purgeQueueZodInput = z.object(this.purgeQueueInput);

	async purgeQueue({
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

			const command = new PurgeQueueCommand(params);
			await sqsClient.send(command);

			return;
		} catch (error) {
			console.error(`Error purging queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new PurgeQueueService();
