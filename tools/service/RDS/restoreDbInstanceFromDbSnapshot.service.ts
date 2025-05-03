import {
	RDSClient,
	RestoreDBInstanceFromDBSnapshotCommand,
	type Tag,
} from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";

class RestoreDbInstanceFromDbSnapshotService {
	/**
	 * Restores an RDS DB instance from a snapshot
	 * @param region The AWS region to use
	 * @param dbInstanceIdentifier The unique identifier for the new DB instance to be created from the snapshot
	 * @param dbSnapshotIdentifier The identifier of the DB snapshot to restore from
	 * @param other Optional parameters for the restored DB instance
	 * @returns Promise containing information about the restored DB instance
	 */

	toolName = "restore-db-instance-from-db-snapshot";
	description = "Restores an RDS DB instance from a snapshot";

	restoreDbInstanceFromDbSnapshotInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region in which to create the restored DB instance",
			),
		dbInstanceIdentifier: z
			.string()
			.describe(
				"The unique identifier for the new DB instance to be created from the snapshot",
			),
		dbSnapshotIdentifier: z
			.string()
			.describe("The identifier of the DB snapshot to restore from"),
		dbInstanceClass: z
			.string()
			.optional()
			.describe("The compute and memory capacity of the restored DB instance"),
		vpcSecurityGroupIds: z
			.array(z.string())
			.optional()
			.describe(
				"A list of VPC security group IDs to associate with the restored DB instance",
			),
		dbSubnetGroupName: z
			.string()
			.optional()
			.describe(
				"The name of the DB subnet group to use for the restored DB instance",
			),
		multiAZ: z
			.boolean()
			.optional()
			.describe(
				"Specifies if the restored DB instance should be a Multi-AZ deployment",
			),
		publiclyAccessible: z
			.boolean()
			.optional()
			.describe(
				"Specifies whether the restored DB instance can be accessed from outside the VPC",
			),
		port: z
			.number()
			.int()
			.optional()
			.describe("The port number on which the database accepts connections"),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe(
				"A list of key-value pairs to assign as tags to the restored DB instance",
			),
	};

	restoreDbInstanceFromDbSnapshotZodInput = z.object(
		this.restoreDbInstanceFromDbSnapshotInput,
	);

	async restoreDbInstanceFromDbSnapshot({
		region,
		dbInstanceIdentifier,
		dbSnapshotIdentifier,
		dbInstanceClass,
		vpcSecurityGroupIds,
		dbSubnetGroupName,
		multiAZ,
		publiclyAccessible,
		port,
		tags,
	}: {
		region: string;
		dbInstanceIdentifier: string;
		dbSnapshotIdentifier: string;
		dbInstanceClass?: string;
		vpcSecurityGroupIds?: string[];
		dbSubnetGroupName?: string;
		multiAZ?: boolean;
		publiclyAccessible?: boolean;
		port?: number;
		tags?: Tag[];
	}) {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to restore DB instance from snapshot
			const command = new RestoreDBInstanceFromDBSnapshotCommand({
				DBInstanceIdentifier: dbInstanceIdentifier,
				DBSnapshotIdentifier: dbSnapshotIdentifier,
				DBInstanceClass: dbInstanceClass,
				VpcSecurityGroupIds: vpcSecurityGroupIds,
				DBSubnetGroupName: dbSubnetGroupName,
				MultiAZ: multiAZ,
				PubliclyAccessible: publiclyAccessible,
				Port: port,
				Tags: tags,
			});

			// Send the command
			const response = await rdsClient.send(command);

			return {
				instance: response.DBInstance,
			};
		} catch (error) {
			console.error(
				`Error restoring RDS DB instance from snapshot ${dbSnapshotIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

const restoreDbInstanceFromDbSnapshotService =
	new RestoreDbInstanceFromDbSnapshotService();

export default new BaseService(
	restoreDbInstanceFromDbSnapshotService.toolName,
	restoreDbInstanceFromDbSnapshotService.description,
	restoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshotInput,
	restoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshotZodInput,
	restoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshot,
);
