import { SQSClient, ListQueuesCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class ListQueuesService {
	/**
	 * Retrieves a detailed list of SQS queues
	 * @param region The AWS region to query (e.g., 'us-east-1')
	 * @param queueNamePrefix Optional prefix to filter queue names
	 * @param outputFormat Optional output format
	 * @returns Promise containing array of queue URLs
	 */

	toolName = "list-queues";
	description = "Retrieves a detailed list of SQS queues";

	listQueuesInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`)",
			),
		queueNamePrefix: z
			.string()
			.optional()
			.describe(
				"Filters the results to include only queues whose names begin with the specified prefix",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe(
				"Specifies the desired output format (`text`, `json`, `table`)",
			),
	};

	listQueuesZodInput = z.object(this.listQueuesInput);

	async listQueues({
		region,
		queueNamePrefix,
		outputFormat = "json",
	}: {
		region: string;
		queueNamePrefix?: string;
		outputFormat?: "text" | "json" | "table";
	}): Promise<string[]> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters
			const params: any = {};
			if (queueNamePrefix) {
				params.QueueNamePrefix = queueNamePrefix;
			}

			const command = new ListQueuesCommand(params);
			const response = await sqsClient.send(command);

			// Return the list of queue URLs
			return response.QueueUrls || [];
		} catch (error) {
			console.error("Error listing SQS queues:", error);
			throw error;
		}
	}
}

export default new ListQueuesService();
