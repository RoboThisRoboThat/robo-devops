import { SNSClient, GetTopicAttributesCommand } from "@aws-sdk/client-sns";
import { z } from "zod";

class GetTopicAttributesService {
	/**
	 * Gets attributes of a specific SNS topic
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param topicArn The ARN of the SNS topic
	 * @returns Promise containing topic attributes
	 */

	toolName = "get-sns-topic-attributes";
	description = "Displays detailed attributes of a specific SNS topic";
	getTopicAttributesInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		topicArn: z
			.string()
			.describe(
				"The ARN of the SNS topic (e.g., 'arn:aws:sns:us-east-1:123456789012:my-topic')",
			),
	};

	getTopicAttributesZodInput = z.object(this.getTopicAttributesInput);

	async getTopicAttributes({
		region,
		topicArn,
	}: {
		region: string;
		topicArn: string;
	}): Promise<Record<string, string>> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new GetTopicAttributesCommand({
				TopicArn: topicArn,
			});

			const response = await snsClient.send(command);

			// Convert the attributes to a simple key-value record
			const attributes: Record<string, string> = {};

			if (response.Attributes) {
				for (const [key, value] of Object.entries(response.Attributes)) {
					attributes[key] = value || "";
				}
			}

			return attributes;
		} catch (error) {
			console.error("Error getting SNS topic attributes:", error);
			throw error;
		}
	}
}

export default new GetTopicAttributesService();
