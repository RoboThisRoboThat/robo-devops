import { SQSClient, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class GetQueueAttributesService {
	/**
	 * Displays detailed attributes of a specific SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue
	 * @param attributeNames Optional list of specific attribute names to retrieve
	 * @param outputFormat Optional output format
	 * @returns Promise containing the queue attributes
	 */

	toolName = "get-queue-attributes";
	description = "Displays detailed attributes of a specific SQS queue";

	getQueueAttributesInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z.string().describe("The URL of the SQS queue"),
		attributeNames: z
			.array(z.string())
			.optional()
			.describe(
				"A list of specific attribute names to retrieve (e.g., `VisibilityTimeout`, `MaximumMessageSize`). If not specified, all attributes are returned",
			),
		outputFormat: z
			.enum(["text", "json"])
			.optional()
			.describe("Specifies the output format (`text`, `json`)"),
	};

	getQueueAttributesZodInput = z.object(this.getQueueAttributesInput);

	async getQueueAttributes({
		region,
		queueUrl,
		attributeNames,
		outputFormat = "json",
	}: {
		region: string;
		queueUrl: string;
		attributeNames?: string[];
		outputFormat?: "text" | "json";
	}): Promise<Record<string, string>> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters
			const params: { QueueUrl: string; AttributeNames?: string[] } = {
				QueueUrl: queueUrl,
			};

			if (attributeNames && attributeNames.length > 0) {
				params.AttributeNames = attributeNames;
			} else {
				params.AttributeNames = ["All"];
			}

			const command = new GetQueueAttributesCommand(params);
			const response = await sqsClient.send(command);

			return response.Attributes || {};
		} catch (error) {
			console.error(`Error getting attributes for queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new GetQueueAttributesService();
