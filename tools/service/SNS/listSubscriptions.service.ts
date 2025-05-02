import { SNSClient, ListSubscriptionsCommand } from "@aws-sdk/client-sns";
import { z } from "zod";

class ListSubscriptionsService {
	/**
	 * Lists SNS subscriptions in the specified AWS region
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @returns Promise containing array of subscription details
	 */

	toolName = "list-sns-subscriptions";
	description =
		"Retrieves a detailed list of SNS subscriptions from a specific AWS region";
	listSubscriptionsInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
	};

	listSubscriptionsZodInput = z.object(this.listSubscriptionsInput);

	async listSubscriptions({
		region,
	}: {
		region: string;
	}): Promise<
		{
			subscriptionArn: string | null;
			topicArn: string | null;
			protocol: string | null;
			endpoint: string | null;
		}[]
	> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new ListSubscriptionsCommand({});
			const response = await snsClient.send(command);

			const subscriptions: {
				subscriptionArn: string | null;
				topicArn: string | null;
				protocol: string | null;
				endpoint: string | null;
			}[] = [];

			if (response.Subscriptions) {
				for (const subscription of response.Subscriptions) {
					subscriptions.push({
						subscriptionArn: subscription.SubscriptionArn || null,
						topicArn: subscription.TopicArn || null,
						protocol: subscription.Protocol || null,
						endpoint: subscription.Endpoint || null,
					});
				}
			}

			return subscriptions;
		} catch (error) {
			console.error("Error listing SNS subscriptions:", error);
			throw error;
		}
	}
}

export default new ListSubscriptionsService();
