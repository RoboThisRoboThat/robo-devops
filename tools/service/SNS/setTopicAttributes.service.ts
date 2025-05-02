import { SNSClient, SetTopicAttributesCommand } from "@aws-sdk/client-sns";
import { z } from "zod";

class SetTopicAttributesService {
	/**
	 * Sets or modifies the attributes of an SNS topic
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param topicArn The ARN of the SNS topic
	 * @param attributeName The name of the attribute to set
	 * @param attributeValue The new value for the attribute
	 * @returns Promise with success status
	 */

	toolName = "set-sns-topic-attributes";
	description = "Sets or modifies the attributes of an SNS topic";
	setTopicAttributesInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		topicArn: z.string().describe("The ARN of the SNS topic to modify"),
		attributeName: z
			.string()
			.describe("The name of the attribute to set (e.g., DisplayName, Policy)"),
		attributeValue: z.string().describe("The new value for the attribute"),
	};

	setTopicAttributesZodInput = z.object(this.setTopicAttributesInput);

	async setTopicAttributes({
		region,
		topicArn,
		attributeName,
		attributeValue,
	}: {
		region: string;
		topicArn: string;
		attributeName: string;
		attributeValue: string;
	}): Promise<{ success: boolean }> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new SetTopicAttributesCommand({
				TopicArn: topicArn,
				AttributeName: attributeName,
				AttributeValue: attributeValue,
			});

			await snsClient.send(command);

			return {
				success: true,
			};
		} catch (error) {
			console.error("Error setting SNS topic attributes:", error);
			throw error;
		}
	}
}

export default new SetTopicAttributesService();
