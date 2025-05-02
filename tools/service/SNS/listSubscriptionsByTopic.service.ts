import {
	SNSClient,
	ListSubscriptionsByTopicCommand,
} from "@aws-sdk/client-sns";
import { z } from "zod";

class ListSubscriptionsByTopicService {
	/**
	 * Lists SNS subscriptions for a specific topic
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param topicArn The ARN of the SNS topic
	 * @returns Promise containing array of subscription details
	 */

	toolName = "list-sns-subscriptions-by-topic";
	description =
		"Retrieves a detailed list of subscriptions to a specific SNS topic";
	listSubscriptionsByTopicInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		topicArn: z
			.string()
			.describe("The ARN of the SNS topic to list subscriptions for"),
	};

	listSubscriptionsByTopicZodInput = z.object(
		this.listSubscriptionsByTopicInput,
	);

	async listSubscriptionsByTopic({
		region,
		topicArn,
	}: {
		region: string;
		topicArn: string;
	}): Promise<
		{
			subscriptionArn: string | null;
			protocol: string | null;
			endpoint: string | null;
		}[]
	> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new ListSubscriptionsByTopicCommand({
				TopicArn: topicArn,
			});

			const response = await snsClient.send(command);

			const subscriptions: {
				subscriptionArn: string | null;
				protocol: string | null;
				endpoint: string | null;
			}[] = [];

			if (response.Subscriptions) {
				for (const subscription of response.Subscriptions) {
					subscriptions.push({
						subscriptionArn: subscription.SubscriptionArn || null,
						protocol: subscription.Protocol || null,
						endpoint: subscription.Endpoint || null,
					});
				}
			}

			return subscriptions;
		} catch (error) {
			console.error("Error listing SNS subscriptions by topic:", error);
			throw error;
		}
	}
}

export default new ListSubscriptionsByTopicService();
