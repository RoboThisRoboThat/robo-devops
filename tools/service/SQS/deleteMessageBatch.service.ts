import { SQSClient, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";
import BaseService from "../base.service";

class DeleteMessageBatchService {
	/**
	 * Deletes multiple messages from a specified SQS queue in a single action
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to delete messages from
	 * @param entries A JSON string or path to a JSON file defining the messages to delete
	 * @returns Promise containing successful and failed deletion results
	 */

	toolName = "delete-message-batch";
	description =
		"Deletes multiple messages from a specified SQS queue in a single action";

	deleteMessageBatchInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z
			.string()
			.describe("The URL of the SQS queue to delete messages from"),
		entries: z
			.string()
			.describe(
				'A JSON string or a path to a JSON file defining the messages to delete. Each entry should have an `Id` (a user-defined identifier) and a `ReceiptHandle`. Example: `\'[{"Id": "msg1", "ReceiptHandle": "AQE..."}]\'`',
			),
	};

	deleteMessageBatchZodInput = z.object(this.deleteMessageBatchInput);

	async deleteMessageBatch({
		region,
		queueUrl,
		entries,
	}: {
		region: string;
		queueUrl: string;
		entries: string;
	}): Promise<{
		successful: { id: string }[];
		failed: { id: string; code: string; message: string }[];
	}> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Parse entries JSON
			let parsedEntries: { Id: string; ReceiptHandle: string }[];
			try {
				parsedEntries = JSON.parse(entries);
			} catch (error) {
				throw new Error(`Failed to parse entries JSON: ${error}`);
			}

			if (!Array.isArray(parsedEntries) || parsedEntries.length === 0) {
				throw new Error("Entries must be a non-empty array");
			}

			if (parsedEntries.length > 10) {
				throw new Error(
					"SQS allows a maximum of 10 entries per batch delete operation",
				);
			}

			// Validate each entry has Id and ReceiptHandle
			for (const entry of parsedEntries) {
				if (!entry.Id || !entry.ReceiptHandle) {
					throw new Error(
						"Each entry must have both Id and ReceiptHandle properties",
					);
				}
			}

			// Prepare command parameters
			const params = {
				QueueUrl: queueUrl,
				Entries: parsedEntries,
			};

			const command = new DeleteMessageBatchCommand(params);
			const response = await sqsClient.send(command);

			// Format the response
			return {
				successful: (response.Successful || []).map((item) => ({
					id: item.Id || "",
				})),
				failed: (response.Failed || []).map((item) => ({
					id: item.Id || "",
					code: item.Code || "",
					message: item.Message || "",
				})),
			};
		} catch (error) {
			console.error(
				`Error batch deleting messages from queue ${queueUrl}:`,
				error,
			);
			throw error;
		}
	}
}

const deleteMessageBatchService = new DeleteMessageBatchService();

export default new BaseService(
	deleteMessageBatchService.toolName,
	deleteMessageBatchService.description,
	deleteMessageBatchService.deleteMessageBatchInput,
	deleteMessageBatchService.deleteMessageBatchZodInput,
	deleteMessageBatchService.deleteMessageBatch,
);
