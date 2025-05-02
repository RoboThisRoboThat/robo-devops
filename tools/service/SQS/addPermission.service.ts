import { SQSClient, AddPermissionCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

class AddPermissionService {
	/**
	 * Adds permissions to a specified SQS queue
	 * @param region The AWS region where the queue resides
	 * @param queueUrl The URL of the SQS queue to add permissions to
	 * @param label The identifier for the permission being added
	 * @param awsAccountIds A comma-separated list of AWS account IDs
	 * @param actions A comma-separated list of SQS actions being granted
	 * @returns Promise with void if successful
	 */

	toolName = "add-permission";
	description =
		"Adds permissions to a specified SQS queue for specific principals to perform actions";

	addPermissionInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the queue resides"),
		queueUrl: z
			.string()
			.describe("The URL of the SQS queue to add permissions to"),
		label: z.string().describe("The identifier for the permission being added"),
		awsAccountIds: z
			.string()
			.describe(
				"A comma-separated list of AWS account IDs of the principals who will receive the permissions",
			),
		actions: z
			.string()
			.describe(
				"A comma-separated list of SQS actions being granted (e.g., `SendMessage`, `ReceiveMessage`, `DeleteMessage`)",
			),
	};

	addPermissionZodInput = z.object(this.addPermissionInput);

	async addPermission({
		region,
		queueUrl,
		label,
		awsAccountIds,
		actions,
	}: {
		region: string;
		queueUrl: string;
		label: string;
		awsAccountIds: string;
		actions: string;
	}): Promise<void> {
		try {
			// Create a new SQSClient with the provided region
			const sqsClient = new SQSClient({ region });

			// Parse account IDs and actions from comma-separated strings
			const accountIdArray = awsAccountIds
				.split(",")
				.map((id) => id.trim())
				.filter(Boolean);
			const actionArray = actions
				.split(",")
				.map((action) => action.trim())
				.filter(Boolean);

			// Validate inputs
			if (accountIdArray.length === 0) {
				throw new Error("At least one AWS account ID must be provided");
			}

			if (actionArray.length === 0) {
				throw new Error("At least one SQS action must be provided");
			}

			// Prepare command parameters
			const params = {
				QueueUrl: queueUrl,
				Label: label,
				AWSAccountIds: accountIdArray,
				Actions: actionArray,
			};

			const command = new AddPermissionCommand(params);
			await sqsClient.send(command);

			return;
		} catch (error) {
			console.error(`Error adding permission to queue ${queueUrl}:`, error);
			throw error;
		}
	}
}

export default new AddPermissionService();
