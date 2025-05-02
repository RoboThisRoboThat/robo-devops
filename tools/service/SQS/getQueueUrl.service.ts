import { SQSClient, GetQueueUrlCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class GetQueueUrlService {
	/**
	 * Retrieves the URL of a specific SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueName The name of the SQS queue
	 * @param queueOwnerAwsAccountId Optional AWS account ID of the queue owner
	 * @param outputFormat Optional output format
	 * @returns Promise containing the queue URL
	 */

	toolName = "get-queue-url";
	description = "Retrieves the URL of a specific SQS queue";

	getQueueUrlInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueName: z
			.string()
			.describe("The name of the SQS queue (e.g., `my-message-queue`)"),
		queueOwnerAwsAccountId: z
			.string()
			.optional()
			.describe(
				"The AWS account ID of the account that created the queue. Required if the queue is owned by someone other than the account making the request",
			),
		outputFormat: z
			.enum(["text"])
			.optional()
			.describe("Specifies the output format (`text`)"),
	};

	getQueueUrlZodInput = z.object(this.getQueueUrlInput);

	async getQueueUrl({
		region,
		queueName,
		queueOwnerAwsAccountId,
		outputFormat = "text",
	}: {
		region: string;
		queueName: string;
		queueOwnerAwsAccountId?: string;
		outputFormat?: "text";
	}): Promise<string> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters
			const params: Record<string, string> = {
				QueueName: queueName,
			};

			if (queueOwnerAwsAccountId) {
				params.QueueOwnerAWSAccountId = queueOwnerAwsAccountId;
			}

			const command = new GetQueueUrlCommand(params);
			const response = await sqsClient.send(command);

			if (!response.QueueUrl) {
				throw new Error(`Queue URL not found for queue name: ${queueName}`);
			}

			return response.QueueUrl;
		} catch (error) {
			console.error(`Error getting URL for queue ${queueName}:`, error);
			throw error;
		}
	}
}

export default new GetQueueUrlService();
