import { SQSClient, CreateQueueCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";
import BaseService from "../base.service";

class CreateQueueService {
	/**
	 * Creates a new SQS queue
	 * @param region The AWS region in which to create the queue
	 * @param queueName The name of the new SQS queue
	 * @param attributes Optional queue attributes to set during creation
	 * @param tags Optional tags to assign to the new queue
	 * @returns Promise containing the queue URL
	 */

	toolName = "create-queue";
	description = "Creates a new SQS queue";

	createQueueInput = {
		region: z
			.string()
			.describe("Specifies the AWS region in which to create the queue"),
		queueName: z
			.string()
			.describe("The name of the new SQS queue (e.g., `new-task-queue`)"),
		attributes: z
			.string()
			.optional()
			.describe(
				"A JSON string or a path to a JSON file specifying the queue attributes to set during creation",
			),
		tags: z
			.array(z.string())
			.optional()
			.describe("A list of key-value pairs to assign as tags to the new queue"),
	};

	createQueueZodInput = z.object(this.createQueueInput);

	async createQueue({
		region,
		queueName,
		attributes,
		tags,
	}: {
		region: string;
		queueName: string;
		attributes?: string;
		tags?: string[];
	}): Promise<string> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Parse attributes if provided
			let parsedAttributes: Record<string, string> = {};
			if (attributes) {
				try {
					parsedAttributes = JSON.parse(attributes);
				} catch (error) {
					throw new Error(`Failed to parse attributes JSON: ${error}`);
				}
			}

			// Parse tags if provided
			const parsedTags: Record<string, string> = {};
			if (tags && tags.length > 0) {
				for (const tag of tags) {
					const [key, value] = tag.split("=");
					if (key && value) {
						parsedTags[key] = value;
					}
				}
			}

			// Prepare command parameters
			const params: {
				QueueName: string;
				Attributes?: Record<string, string>;
				tags?: Record<string, string>;
			} = {
				QueueName: queueName,
			};

			if (Object.keys(parsedAttributes).length > 0) {
				params.Attributes = parsedAttributes;
			}

			if (Object.keys(parsedTags).length > 0) {
				params.tags = parsedTags;
			}

			const command = new CreateQueueCommand(params);
			const response = await sqsClient.send(command);

			if (!response.QueueUrl) {
				throw new Error(`Failed to create queue: ${queueName}`);
			}

			return response.QueueUrl;
		} catch (error) {
			console.error(`Error creating queue ${queueName}:`, error);
			throw error;
		}
	}
}

const createQueueService = new CreateQueueService();

export default new BaseService(
	createQueueService.toolName,
	createQueueService.description,
	createQueueService.createQueueInput,
	createQueueService.createQueueZodInput,
	createQueueService.createQueue,
);
