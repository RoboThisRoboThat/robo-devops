import {
	SQSClient,
	ListDeadLetterSourceQueuesCommand,
} from "@aws-sdk/client-sqs";
import { z } from "zod";

class ListDeadLetterSourceQueuesService {
	/**
	 * Returns a list of the source queues for a specified dead-letter queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the dead-letter queue
	 * @param outputFormat Optional output format
	 * @returns Promise containing the list of source queue URLs
	 */

	toolName = "list-dead-letter-source-queues";
	description =
		"Returns a list of the source queues for a specified dead-letter queue";

	listDeadLetterSourceQueuesInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z.string().describe("The URL of the dead-letter queue"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the output format (`text`, `json`, `table`)"),
	};

	listDeadLetterSourceQueuesZodInput = z.object(
		this.listDeadLetterSourceQueuesInput,
	);

	async listDeadLetterSourceQueues({
		region,
		queueUrl,
		outputFormat = "json",
	}: {
		region: string;
		queueUrl: string;
		outputFormat?: "text" | "json" | "table";
	}): Promise<string[]> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters
			const params = {
				QueueUrl: queueUrl,
			};

			const command = new ListDeadLetterSourceQueuesCommand(params);
			const response = await sqsClient.send(command);

			return response.QueueUrls || [];
		} catch (error) {
			console.error(
				`Error listing dead letter source queues for ${queueUrl}:`,
				error,
			);
			throw error;
		}
	}
}

export default new ListDeadLetterSourceQueuesService();
