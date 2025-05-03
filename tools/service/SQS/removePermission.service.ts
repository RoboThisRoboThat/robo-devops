import { SQSClient, RemovePermissionCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";
import BaseService from "../base.service";

class RemovePermissionService {
	/**
	 * Removes permissions from a specified SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to remove permissions from
	 * @param label The identifier of the permission to remove
	 * @returns Promise with void if successful
	 */

	toolName = "remove-permission";
	description =
		"Removes the permission with the specified label from an SQS queue";

	removePermissionInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z
			.string()
			.describe("The URL of the SQS queue to remove permissions from"),
		label: z.string().describe("The identifier of the permission to remove"),
	};

	removePermissionZodInput = z.object(this.removePermissionInput);

	async removePermission({
		region,
		queueUrl,
		label,
	}: {
		region: string;
		queueUrl: string;
		label: string;
	}): Promise<void> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Prepare command parameters
			const params = {
				QueueUrl: queueUrl,
				Label: label,
			};

			const command = new RemovePermissionCommand(params);
			await sqsClient.send(command);

			return;
		} catch (error) {
			console.error(
				`Error removing permission ${label} from queue ${queueUrl}:`,
				error,
			);
			throw error;
		}
	}
}

const removePermissionService = new RemovePermissionService();

export default new BaseService(
	removePermissionService.toolName,
	removePermissionService.description,
	removePermissionService.removePermissionInput,
	removePermissionService.removePermissionZodInput,
	removePermissionService.removePermission,
);
