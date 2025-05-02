import {
	SNSClient,
	CreateTopicCommand,
	CreateTopicCommandInput,
} from "@aws-sdk/client-sns";
import { z } from "zod";

class CreateTopicService {
	/**
	 * Creates a new SNS topic
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param name The name of the SNS topic
	 * @param attributes Optional attributes for the SNS topic
	 * @param tags Optional tags for the SNS topic
	 * @returns Promise containing the ARN of the created topic
	 */

	toolName = "create-sns-topic";
	description = "Creates a new SNS topic in a specific AWS region";
	createTopicInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		name: z
			.string()
			.describe(
				"The name of the new SNS topic (e.g., 'new-notification-topic')",
			),
		attributes: z
			.record(z.string())
			.optional()
			.describe(
				"A record of attribute name/value pairs for topic attributes (e.g., {'DisplayName': 'My Topic'})",
			),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe("Array of tags to apply to the topic"),
	};

	createTopicZodInput = z.object(this.createTopicInput);

	async createTopic({
		region,
		name,
		attributes = {},
		tags = [],
	}: {
		region: string;
		name: string;
		attributes?: Record<string, string>;
		tags?: { Key: string; Value: string }[];
	}): Promise<{ topicArn: string | null }> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const input: CreateTopicCommandInput = {
				Name: name,
				Attributes: attributes,
				Tags: tags,
			};

			const command = new CreateTopicCommand(input);
			const response = await snsClient.send(command);

			return {
				topicArn: response.TopicArn || null,
			};
		} catch (error) {
			console.error("Error creating SNS topic:", error);
			throw error;
		}
	}
}

export default new CreateTopicService();
