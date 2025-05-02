import {
	SNSClient,
	ListTopicsCommand,
	ListTopicsCommandOutput,
} from "@aws-sdk/client-sns";
import { z } from "zod";

class ListTopicsService {
	/**
	 * Lists SNS topics in the specified AWS region
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @returns Promise containing array of topic ARNs and their details
	 */

	toolName = "list-sns-topics";
	description =
		"Retrieves a detailed list of SNS topics from a specific AWS region";
	listTopicsInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
	};

	listTopicsZodInput = z.object(this.listTopicsInput);

	async listTopics({
		region,
	}: {
		region: string;
	}): Promise<{ topicArn: string | null }[]> {
		try {
			// Create a new SNSClient for each call with the provided region
			const snsClient = new SNSClient({ region });

			const command = new ListTopicsCommand({});
			const response = await snsClient.send(command);

			const topics: { topicArn: string | null }[] = [];

			if (response.Topics) {
				for (const topic of response.Topics) {
					topics.push({
						topicArn: topic.TopicArn || null,
					});
				}
			}

			return topics;
		} catch (error) {
			console.error("Error listing SNS topics:", error);
			throw error;
		}
	}
}

export default new ListTopicsService();
