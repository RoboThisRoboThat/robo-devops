import { SNSClient, DeleteTopicCommand } from "@aws-sdk/client-sns";
import { z } from "zod";

class DeleteTopicService {
	/**
	 * Deletes an SNS topic
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param topicArn The ARN of the SNS topic to delete
	 * @returns Promise with success status
	 */

	toolName = "delete-sns-topic";
	description = "Deletes a specified SNS topic";
	deleteTopicInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		topicArn: z.string().describe("The ARN of the SNS topic to delete"),
	};

	deleteTopicZodInput = z.object(this.deleteTopicInput);

	async deleteTopic({
		region,
		topicArn,
	}: {
		region: string;
		topicArn: string;
	}): Promise<{ success: boolean }> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new DeleteTopicCommand({
				TopicArn: topicArn,
			});

			await snsClient.send(command);

			return {
				success: true,
			};
		} catch (error) {
			console.error("Error deleting SNS topic:", error);
			throw error;
		}
	}
}

export default new DeleteTopicService();
