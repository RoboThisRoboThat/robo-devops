import {
	SNSClient,
	PublishCommand,
	MessageAttributeValue,
} from "@aws-sdk/client-sns";
import { z } from "zod";

class PublishService {
	/**
	 * Publishes a message to an SNS topic
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param topicArn The ARN of the SNS topic
	 * @param message The message to publish
	 * @param subject Optional subject for the message (for email)
	 * @param messageStructure Optional message structure (simple or json)
	 * @param messageAttributes Optional message attributes
	 * @param targetArn Optional target ARN for direct messages
	 * @param phoneNumber Optional phone number for direct SMS
	 * @returns Promise containing the message ID
	 */

	toolName = "publish-sns-message";
	description = "Publishes a message to a specified SNS topic";
	publishInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		topicArn: z
			.string()
			.optional()
			.describe("The ARN of the SNS topic to publish to"),
		message: z.string().describe("The message to send"),
		subject: z
			.string()
			.optional()
			.describe("The subject line for email endpoints"),
		messageStructure: z
			.enum(["simple", "json"])
			.optional()
			.default("simple")
			.describe("Specifies the format of the message (simple or json)"),
		messageAttributes: z
			.record(
				z.object({
					DataType: z.string(),
					StringValue: z.string().optional(),
					BinaryValue: z.string().optional(),
				}),
			)
			.optional()
			.describe("Message attributes as key-value pairs"),
		targetArn: z
			.string()
			.optional()
			.describe("The ARN of an endpoint to send a direct message to"),
		phoneNumber: z
			.string()
			.optional()
			.describe("The phone number to send an SMS message to directly"),
	};

	publishZodInput = z.object(this.publishInput);

	async publish({
		region,
		topicArn,
		message,
		subject,
		messageStructure = "simple",
		messageAttributes = {},
		targetArn,
		phoneNumber,
	}: {
		region: string;
		topicArn?: string;
		message: string;
		subject?: string;
		messageStructure?: "simple" | "json";
		messageAttributes?: Record<
			string,
			{
				DataType: string;
				StringValue?: string;
				BinaryValue?: string;
			}
		>;
		targetArn?: string;
		phoneNumber?: string;
	}): Promise<{ messageId: string | null }> {
		try {
			// Validate that at least one destination is provided
			if (!topicArn && !targetArn && !phoneNumber) {
				throw new Error(
					"At least one of topicArn, targetArn, or phoneNumber must be provided",
				);
			}

			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			// Convert message attributes to the required format
			const formattedMessageAttributes: Record<string, MessageAttributeValue> =
				{};

			for (const [key, value] of Object.entries(messageAttributes)) {
				formattedMessageAttributes[key] = {
					DataType: value.DataType,
					StringValue: value.StringValue,
					BinaryValue: value.BinaryValue
						? Buffer.from(value.BinaryValue)
						: undefined,
				};
			}

			const command = new PublishCommand({
				TopicArn: topicArn,
				TargetArn: targetArn,
				PhoneNumber: phoneNumber,
				Message: message,
				Subject: subject,
				MessageStructure: messageStructure === "json" ? "json" : undefined,
				MessageAttributes:
					Object.keys(formattedMessageAttributes).length > 0
						? formattedMessageAttributes
						: undefined,
			});

			const response = await snsClient.send(command);

			return {
				messageId: response.MessageId || null,
			};
		} catch (error) {
			console.error("Error publishing message to SNS:", error);
			throw error;
		}
	}
}

export default new PublishService();
