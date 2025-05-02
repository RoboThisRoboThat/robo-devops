import { SQSClient, SetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class SetQueuePolicyService {
	/**
	 * Sets or modifies the policy of an SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to set the policy for
	 * @param policy A JSON string or a path to a JSON file containing the policy document
	 * @returns Promise with void if successful
	 */

	toolName = "set-queue-policy";
	description = "Sets or modifies the policy of an SQS queue";

	setQueuePolicyInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z
			.string()
			.describe("The URL of the SQS queue to set the policy for"),
		policy: z
			.string()
			.describe(
				"A JSON string or a path to a JSON file containing the policy document",
			),
	};

	setQueuePolicyZodInput = z.object(this.setQueuePolicyInput);

	async setQueuePolicy({
		region,
		queueUrl,
		policy,
	}: {
		region: string;
		queueUrl: string;
		policy: string;
	}): Promise<void> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Validate policy is valid JSON
			try {
				JSON.parse(policy);
			} catch (error) {
				throw new Error(`Invalid policy JSON: ${error}`);
			}

			// Prepare command parameters
			const params = {
				QueueUrl: queueUrl,
				Attributes: {
					Policy: policy,
				},
			};

			const command = new SetQueueAttributesCommand(params);
			await sqsClient.send(command);

			return;
		} catch (error) {
			console.error(`Error setting policy for queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new SetQueuePolicyService();
