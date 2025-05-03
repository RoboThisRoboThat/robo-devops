import {
	RDSClient,
	RestoreDBClusterFromSnapshotCommand,
} from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";

class RestoreDbClusterFromSnapshotService {
	/**
	 * Restores an RDS DB cluster (Aurora) from a snapshot
	 * @param region The AWS region to use
	 * @param dbClusterIdentifier The unique identifier for the new DB cluster to be created from the snapshot
	 * @param dbClusterSnapshotIdentifier The identifier of the DB cluster snapshot to restore from
	 * @param other Optional parameters for the restored DB cluster
	 * @returns Promise containing information about the restored DB cluster
	 */

	toolName = "restore-db-cluster-from-snapshot";
	description = "Restores an RDS DB cluster (Aurora) from a snapshot";

	restoreDbClusterFromSnapshotInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region in which to create the restored DB cluster",
			),
		dbClusterIdentifier: z
			.string()
			.describe(
				"The unique identifier for the new DB cluster to be created from the snapshot",
			),
		dbClusterSnapshotIdentifier: z
			.string()
			.describe("The identifier of the DB cluster snapshot to restore from"),
		vpcSecurityGroupIds: z
			.array(z.string())
			.optional()
			.describe(
				"A list of VPC security group IDs to associate with the restored DB cluster",
			),
		dbSubnetGroupName: z
			.string()
			.optional()
			.describe(
				"The name of the DB subnet group to use for the restored DB cluster",
			),
		port: z
			.number()
			.int()
			.optional()
			.describe("The port number on which the database accepts connections"),
	};

	restoreDbClusterFromSnapshotZodInput = z.object(
		this.restoreDbClusterFromSnapshotInput,
	);

	async restoreDbClusterFromSnapshot({
		region,
		dbClusterIdentifier,
		dbClusterSnapshotIdentifier,
		vpcSecurityGroupIds,
		dbSubnetGroupName,
		port,
	}: {
		region: string;
		dbClusterIdentifier: string;
		dbClusterSnapshotIdentifier: string;
		vpcSecurityGroupIds?: string[];
		dbSubnetGroupName?: string;
		port?: number;
	}) {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to restore DB cluster from snapshot
			const command = new RestoreDBClusterFromSnapshotCommand({
				DBClusterIdentifier: dbClusterIdentifier,
				SnapshotIdentifier: dbClusterSnapshotIdentifier,
				VpcSecurityGroupIds: vpcSecurityGroupIds,
				DBSubnetGroupName: dbSubnetGroupName,
				Port: port,
			});

			// Send the command
			const response = await rdsClient.send(command);

			return {
				cluster: response.DBCluster,
			};
		} catch (error) {
			console.error(
				`Error restoring RDS DB cluster from snapshot ${dbClusterSnapshotIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

const restoreDbClusterFromSnapshotService =
	new RestoreDbClusterFromSnapshotService();

export default new BaseService(
	restoreDbClusterFromSnapshotService.toolName,
	restoreDbClusterFromSnapshotService.description,
	restoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshotInput,
	restoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshotZodInput,
	restoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshot,
);
