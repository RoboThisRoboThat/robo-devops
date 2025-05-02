import { SNSClient, SubscribeCommand } from "@aws-sdk/client-sns";
import { z } from "zod";

class SubscribeService {
	/**
	 * Creates a new subscription to an SNS topic
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param topicArn The ARN of the SNS topic
	 * @param protocol The protocol for the subscription (e.g., 'email', 'sms', etc.)
	 * @param endpoint The endpoint for the subscription (e.g., email address, phone number, etc.)
	 * @param attributes Optional attributes for the subscription
	 * @param returnSubscriptionArn Whether to return the subscription ARN
	 * @returns Promise containing the subscription ARN
	 */

	toolName = "subscribe-sns-topic";
	description = "Creates a new SNS subscription to a topic";
	subscribeInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		topicArn: z.string().describe("The ARN of the SNS topic to subscribe to"),
		protocol: z
			.string()
			.describe(
				"The protocol to use for the subscription endpoint (e.g., email, sms, sqs, lambda, http, https, application)",
			),
		endpoint: z
			.string()
			.describe("The endpoint that will receive notifications"),
		attributes: z
			.record(z.string())
			.optional()
			.describe(
				"A record of attribute name/value pairs for subscription attributes",
			),
		returnSubscriptionArn: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"If true, the ARN of the newly created subscription is returned",
			),
	};

	subscribeZodInput = z.object(this.subscribeInput);

	async subscribe({
		region,
		topicArn,
		protocol,
		endpoint,
		attributes = {},
		returnSubscriptionArn = false,
	}: {
		region: string;
		topicArn: string;
		protocol: string;
		endpoint: string;
		attributes?: Record<string, string>;
		returnSubscriptionArn?: boolean;
	}): Promise<{ subscriptionArn: string | null }> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new SubscribeCommand({
				TopicArn: topicArn,
				Protocol: protocol,
				Endpoint: endpoint,
				Attributes: attributes,
				ReturnSubscriptionArn: returnSubscriptionArn,
			});

			const response = await snsClient.send(command);

			return {
				subscriptionArn: response.SubscriptionArn || null,
			};
		} catch (error) {
			console.error("Error subscribing to SNS topic:", error);
			throw error;
		}
	}
}

export default new SubscribeService();
