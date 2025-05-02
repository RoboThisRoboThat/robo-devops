import {
	SNSClient,
	SetSubscriptionAttributesCommand,
} from "@aws-sdk/client-sns";
import { z } from "zod";

class SetSubscriptionAttributesService {
	/**
	 * Sets or modifies the attributes of an SNS subscription
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param subscriptionArn The ARN of the SNS subscription
	 * @param attributeName The name of the attribute to set
	 * @param attributeValue The new value for the attribute
	 * @returns Promise with success status
	 */

	toolName = "set-sns-subscription-attributes";
	description = "Sets or modifies the attributes of an SNS subscription";
	setSubscriptionAttributesInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		subscriptionArn: z
			.string()
			.describe("The ARN of the SNS subscription to modify"),
		attributeName: z
			.string()
			.describe(
				"The name of the attribute to set (e.g., FilterPolicy, DeliveryPolicy)",
			),
		attributeValue: z.string().describe("The new value for the attribute"),
	};

	setSubscriptionAttributesZodInput = z.object(
		this.setSubscriptionAttributesInput,
	);

	async setSubscriptionAttributes({
		region,
		subscriptionArn,
		attributeName,
		attributeValue,
	}: {
		region: string;
		subscriptionArn: string;
		attributeName: string;
		attributeValue: string;
	}): Promise<{ success: boolean }> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new SetSubscriptionAttributesCommand({
				SubscriptionArn: subscriptionArn,
				AttributeName: attributeName,
				AttributeValue: attributeValue,
			});

			await snsClient.send(command);

			return {
				success: true,
			};
		} catch (error) {
			console.error("Error setting SNS subscription attributes:", error);
			throw error;
		}
	}
}

export default new SetSubscriptionAttributesService();
