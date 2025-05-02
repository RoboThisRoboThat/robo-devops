import { SNSClient, UnsubscribeCommand } from "@aws-sdk/client-sns";
import { z } from "zod";

class UnsubscribeService {
	/**
	 * Deletes an SNS subscription
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param subscriptionArn The ARN of the SNS subscription to delete
	 * @returns Promise with success status
	 */

	toolName = "unsubscribe-sns";
	description = "Deletes a specified SNS subscription";
	unsubscribeInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		subscriptionArn: z
			.string()
			.describe("The ARN of the SNS subscription to delete"),
	};

	unsubscribeZodInput = z.object(this.unsubscribeInput);

	async unsubscribe({
		region,
		subscriptionArn,
	}: {
		region: string;
		subscriptionArn: string;
	}): Promise<{ success: boolean }> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new UnsubscribeCommand({
				SubscriptionArn: subscriptionArn,
			});

			await snsClient.send(command);

			return {
				success: true,
			};
		} catch (error) {
			console.error("Error unsubscribing from SNS topic:", error);
			throw error;
		}
	}
}

export default new UnsubscribeService();
