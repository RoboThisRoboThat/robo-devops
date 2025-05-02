import {
	SNSClient,
	GetSubscriptionAttributesCommand,
} from "@aws-sdk/client-sns";
import { z } from "zod";

class GetSubscriptionAttributesService {
	/**
	 * Gets attributes of a specific SNS subscription
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param subscriptionArn The ARN of the SNS subscription
	 * @returns Promise containing subscription attributes
	 */

	toolName = "get-sns-subscription-attributes";
	description = "Displays detailed attributes of a specific SNS subscription";
	getSubscriptionAttributesInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		subscriptionArn: z.string().describe("The ARN of the SNS subscription"),
	};

	getSubscriptionAttributesZodInput = z.object(
		this.getSubscriptionAttributesInput,
	);

	async getSubscriptionAttributes({
		region,
		subscriptionArn,
	}: {
		region: string;
		subscriptionArn: string;
	}): Promise<Record<string, string>> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new GetSubscriptionAttributesCommand({
				SubscriptionArn: subscriptionArn,
			});

			const response = await snsClient.send(command);

			// Convert the attributes to a simple key-value record
			const attributes: Record<string, string> = {};

			if (response.Attributes) {
				for (const [key, value] of Object.entries(response.Attributes)) {
					if (typeof value === "string") {
						attributes[key] = value;
					} else if (value !== null && value !== undefined) {
						attributes[key] = JSON.stringify(value);
					}
				}
			}

			return attributes;
		} catch (error) {
			console.error("Error getting SNS subscription attributes:", error);
			throw error;
		}
	}
}

export default new GetSubscriptionAttributesService();
