import { RDSClient, CreateDBClusterSnapshotCommand } from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";

class CreateDbClusterSnapshotService {
	/**
	 * Creates a snapshot of a specified RDS DB cluster (Aurora)
	 * @param region The AWS region to use
	 * @param dbClusterIdentifier The unique identifier of the source DB cluster
	 * @param dbClusterSnapshotIdentifier The identifier for the new DB cluster snapshot
	 * @returns Promise containing information about the created snapshot
	 */

	toolName = "create-db-cluster-snapshot";
	description = "Creates a snapshot of a specified RDS DB cluster (Aurora)";

	createDbClusterSnapshotInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the DB cluster resides"),
		dbClusterIdentifier: z
			.string()
			.describe("The unique identifier of the source DB cluster"),
		dbClusterSnapshotIdentifier: z
			.string()
			.describe("The identifier for the new DB cluster snapshot"),
	};

	createDbClusterSnapshotZodInput = z.object(this.createDbClusterSnapshotInput);

	async createDbClusterSnapshot({
		region,
		dbClusterIdentifier,
		dbClusterSnapshotIdentifier,
	}: {
		region: string;
		dbClusterIdentifier: string;
		dbClusterSnapshotIdentifier: string;
	}) {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to create a DB cluster snapshot
			const command = new CreateDBClusterSnapshotCommand({
				DBClusterIdentifier: dbClusterIdentifier,
				DBClusterSnapshotIdentifier: dbClusterSnapshotIdentifier,
			});

			// Send the command
			const response = await rdsClient.send(command);

			return {
				snapshot: response.DBClusterSnapshot,
			};
		} catch (error) {
			console.error(
				`Error creating RDS DB cluster snapshot for ${dbClusterIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

const createDbClusterSnapshotService = new CreateDbClusterSnapshotService();

export default new BaseService(
	createDbClusterSnapshotService.toolName,
	createDbClusterSnapshotService.description,
	createDbClusterSnapshotService.createDbClusterSnapshotInput,
	createDbClusterSnapshotService.createDbClusterSnapshotZodInput,
	createDbClusterSnapshotService.createDbClusterSnapshot,
);
