import { RDSClient, DeleteDBClusterCommand } from "@aws-sdk/client-rds";
import { z } from "zod";

class DeleteDbClusterService {
	/**
	 * Deletes a specified RDS DB cluster (Aurora)
	 * @param region The AWS region to use
	 * @param dbClusterIdentifier The unique identifier for the DB cluster to delete
	 * @param finalDbClusterSnapshotIdentifier Optional final DB cluster snapshot identifier to create before deletion
	 * @param skipFinalSnapshot Whether to skip creating a final snapshot (use with caution)
	 * @returns Promise containing information about the deletion process
	 */

	toolName = "delete-db-cluster";
	description = "Deletes a specified RDS DB cluster (Aurora)";

	deleteDbClusterInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the DB cluster resides"),
		dbClusterIdentifier: z
			.string()
			.describe("The unique identifier for the DB cluster to delete"),
		finalDbClusterSnapshotIdentifier: z
			.string()
			.optional()
			.describe(
				"Creates a final DB cluster snapshot with the specified identifier before deleting the DB cluster",
			),
		skipFinalSnapshot: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Specifies whether to skip the creation of a final DB cluster snapshot. Use with caution",
			),
	};

	deleteDbClusterZodInput = z.object(this.deleteDbClusterInput);

	async deleteDbCluster({
		region,
		dbClusterIdentifier,
		finalDbClusterSnapshotIdentifier,
		skipFinalSnapshot = false,
	}: {
		region: string;
		dbClusterIdentifier: string;
		finalDbClusterSnapshotIdentifier?: string;
		skipFinalSnapshot?: boolean;
	}) {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Validate parameters
			if (!skipFinalSnapshot && !finalDbClusterSnapshotIdentifier) {
				throw new Error(
					"Either skipFinalSnapshot must be true or finalDbClusterSnapshotIdentifier must be provided",
				);
			}

			// Create the command to delete the DB cluster
			const command = new DeleteDBClusterCommand({
				DBClusterIdentifier: dbClusterIdentifier,
				SkipFinalSnapshot: skipFinalSnapshot,
				FinalDBSnapshotIdentifier: skipFinalSnapshot
					? undefined
					: finalDbClusterSnapshotIdentifier,
			});

			// Send the command
			const response = await rdsClient.send(command);

			return {
				cluster: response.DBCluster,
			};
		} catch (error) {
			console.error(
				`Error deleting RDS DB cluster ${dbClusterIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

export default new DeleteDbClusterService();
