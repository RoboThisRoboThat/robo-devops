import { SQSClient, SetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class SetQueueAttributesService {
	/**
	 * Sets or modifies the attributes of an SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to modify
	 * @param attributes A JSON string or a path to a JSON file specifying the attributes to set
	 * @returns Promise with void if successful
	 */

	toolName = "set-queue-attributes";
	description = "Sets or modifies the attributes of an SQS queue";

	setQueueAttributesInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z.string().describe("The URL of the SQS queue to modify"),
		attributes: z
			.string()
			.describe(
				'A JSON string or a path to a JSON file specifying the attributes to set (e.g., `\'{"VisibilityTimeout": "60"}\'`). The JSON should be a map of attribute name to attribute value (as a string)',
			),
	};

	setQueueAttributesZodInput = z.object(this.setQueueAttributesInput);

	async setQueueAttributes({
		region,
		queueUrl,
		attributes,
	}: {
		region: string;
		queueUrl: string;
		attributes: string;
	}): Promise<void> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Parse attributes JSON
			let parsedAttributes: Record<string, string>;
			try {
				parsedAttributes = JSON.parse(attributes);
			} catch (error) {
				throw new Error(`Failed to parse attributes JSON: ${error}`);
			}

			// Validate attributes
			if (
				typeof parsedAttributes !== "object" ||
				Array.isArray(parsedAttributes) ||
				!parsedAttributes
			) {
				throw new Error("Attributes must be a non-empty object");
			}

			// Ensure all values are strings
			const stringifiedAttributes: Record<string, string> = {};
			for (const [key, value] of Object.entries(parsedAttributes)) {
				stringifiedAttributes[key] = String(value);
			}

			// Prepare command parameters
			const params = {
				QueueUrl: queueUrl,
				Attributes: stringifiedAttributes,
			};

			const command = new SetQueueAttributesCommand(params);
			await sqsClient.send(command);

			return;
		} catch (error) {
			console.error(`Error setting attributes for queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new SetQueueAttributesService();
