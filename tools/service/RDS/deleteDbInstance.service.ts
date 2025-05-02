import { RDSClient, DeleteDBInstanceCommand } from "@aws-sdk/client-rds";
import { z } from "zod";

class DeleteDbInstanceService {
	/**
	 * Deletes a specified RDS DB instance
	 * @param region The AWS region to use
	 * @param dbInstanceIdentifier The unique identifier for the DB instance to delete
	 * @param finalDbSnapshotIdentifier Optional final DB snapshot identifier to create before deletion
	 * @param skipFinalSnapshot Whether to skip creating a final snapshot (use with caution)
	 * @returns Promise containing information about the deletion process
	 */

	toolName = "delete-db-instance";
	description = "Deletes a specified RDS DB instance";

	deleteDbInstanceInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the DB instance resides"),
		dbInstanceIdentifier: z
			.string()
			.describe("The unique identifier for the DB instance to delete"),
		finalDbSnapshotIdentifier: z
			.string()
			.optional()
			.describe(
				"Creates a final DB snapshot with the specified identifier before deleting the DB instance",
			),
		skipFinalSnapshot: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Specifies whether to skip the creation of a final DB snapshot. Use with caution",
			),
	};

	deleteDbInstanceZodInput = z.object(this.deleteDbInstanceInput);

	async deleteDbInstance({
		region,
		dbInstanceIdentifier,
		finalDbSnapshotIdentifier,
		skipFinalSnapshot = false,
	}: {
		region: string;
		dbInstanceIdentifier: string;
		finalDbSnapshotIdentifier?: string;
		skipFinalSnapshot?: boolean;
	}) {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Validate parameters
			if (!skipFinalSnapshot && !finalDbSnapshotIdentifier) {
				throw new Error(
					"Either skipFinalSnapshot must be true or finalDbSnapshotIdentifier must be provided",
				);
			}

			// Create the command to delete the DB instance
			const command = new DeleteDBInstanceCommand({
				DBInstanceIdentifier: dbInstanceIdentifier,
				SkipFinalSnapshot: skipFinalSnapshot,
				FinalDBSnapshotIdentifier: skipFinalSnapshot
					? undefined
					: finalDbSnapshotIdentifier,
			});

			// Send the command
			const response = await rdsClient.send(command);

			return {
				instance: response.DBInstance,
			};
		} catch (error) {
			console.error(
				`Error deleting RDS DB instance ${dbInstanceIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

export default new DeleteDbInstanceService();
