import { SQSClient, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class GetQueuePolicyService {
	/**
	 * Retrieves the policy of a specified SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to get the policy for
	 * @param outputFormat Optional output format
	 * @returns Promise containing the queue policy as a JSON string
	 */

	toolName = "get-queue-policy";
	description = "Retrieves the policy of a specified SQS queue";

	getQueuePolicyInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z
			.string()
			.describe("The URL of the SQS queue to get the policy for"),
		outputFormat: z
			.enum(["text", "json"])
			.optional()
			.describe("Specifies the output format (`text`, `json`)"),
	};

	getQueuePolicyZodInput = z.object(this.getQueuePolicyInput);

	async getQueuePolicy({
		region,
		queueUrl,
		outputFormat = "json",
	}: {
		region: string;
		queueUrl: string;
		outputFormat?: "text" | "json";
	}): Promise<string> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters to retrieve only the Policy attribute
			const params = {
				QueueUrl: queueUrl,
				AttributeNames: ["Policy"],
			};

			const command = new GetQueueAttributesCommand(params);
			const response = await sqsClient.send(command);

			// Extract the policy from the response
			const policy = response.Attributes?.Policy;

			if (!policy) {
				return ""; // No policy is set on the queue
			}

			return policy;
		} catch (error) {
			console.error(`Error getting policy for queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new GetQueuePolicyService();
