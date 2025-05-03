import {
	RDSClient,
	CreateDBClusterCommand,
	type Tag,
} from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";

class CreateDbClusterService {
	/**
	 * Creates a new RDS DB cluster (Aurora) with specified configurations
	 * @param region The AWS region to use
	 * @param dbClusterIdentifier The unique identifier for the DB cluster
	 * @param engine The database engine to use for this DB cluster
	 * @param other Optional parameters as described in the RDS API
	 * @returns Promise containing information about the created DB cluster
	 */

	toolName = "create-db-cluster";
	description =
		"Creates a new RDS DB cluster (Aurora) with specified configurations";

	createDbClusterInput = {
		region: z
			.string()
			.describe("Specifies the AWS region in which to create the DB cluster"),
		dbClusterIdentifier: z
			.string()
			.describe(
				"The unique identifier for the DB cluster (e.g., `new-aurora-cluster`)",
			),
		engine: z
			.string()
			.describe(
				"The name of the database engine to be used for this DB cluster (e.g., `aurora`, `aurora-mysql`, `aurora-postgresql`)",
			),
		engineVersion: z
			.string()
			.optional()
			.describe("The version number of the database engine to use"),
		databaseName: z
			.string()
			.optional()
			.describe(
				"The name of the initial database to create when the DB cluster is created",
			),
		masterUsername: z
			.string()
			.describe("The username for the master user account"),
		masterPassword: z
			.string()
			.describe("The password for the master user account"),
		vpcSecurityGroupIds: z
			.array(z.string())
			.optional()
			.describe(
				"A list of VPC security group IDs to associate with the DB cluster",
			),
		dbSubnetGroupName: z
			.string()
			.describe("The name of the DB subnet group to use for the DB cluster"),
		availabilityZones: z
			.array(z.string())
			.optional()
			.describe(
				"A list of Availability Zones (AZs) in which to create the DB cluster",
			),
		backupRetentionPeriod: z
			.number()
			.int()
			.optional()
			.describe("The number of days for which automatic backups are retained"),
		preferredBackupWindow: z
			.string()
			.optional()
			.describe(
				"The daily time range during which automated backups are created",
			),
		preferredMaintenanceWindow: z
			.string()
			.optional()
			.describe(
				"The weekly time range during which system maintenance can occur",
			),
		port: z
			.number()
			.int()
			.optional()
			.describe("The port number on which the database accepts connections"),
		storageEncrypted: z
			.boolean()
			.optional()
			.default(false)
			.describe("Specifies whether the DB cluster should be encrypted at rest"),
		kmsKeyId: z
			.string()
			.optional()
			.describe("The AWS KMS key identifier for encryption"),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe(
				"A list of key-value pairs to assign as tags to the new DB cluster",
			),
	};

	createDbClusterZodInput = z.object(this.createDbClusterInput);

	async createDbCluster({
		region,
		dbClusterIdentifier,
		engine,
		engineVersion,
		databaseName,
		masterUsername,
		masterPassword,
		vpcSecurityGroupIds,
		dbSubnetGroupName,
		availabilityZones,
		backupRetentionPeriod,
		preferredBackupWindow,
		preferredMaintenanceWindow,
		port,
		storageEncrypted = false,
		kmsKeyId,
		tags,
	}: {
		region: string;
		dbClusterIdentifier: string;
		engine: string;
		engineVersion?: string;
		databaseName?: string;
		masterUsername: string;
		masterPassword: string;
		vpcSecurityGroupIds?: string[];
		dbSubnetGroupName: string;
		availabilityZones?: string[];
		backupRetentionPeriod?: number;
		preferredBackupWindow?: string;
		preferredMaintenanceWindow?: string;
		port?: number;
		storageEncrypted?: boolean;
		kmsKeyId?: string;
		tags?: Tag[];
	}) {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to create a new DB cluster
			const command = new CreateDBClusterCommand({
				DBClusterIdentifier: dbClusterIdentifier,
				Engine: engine,
				EngineVersion: engineVersion,
				DatabaseName: databaseName,
				MasterUsername: masterUsername,
				MasterUserPassword: masterPassword,
				VpcSecurityGroupIds: vpcSecurityGroupIds,
				DBSubnetGroupName: dbSubnetGroupName,
				AvailabilityZones: availabilityZones,
				BackupRetentionPeriod: backupRetentionPeriod,
				PreferredBackupWindow: preferredBackupWindow,
				PreferredMaintenanceWindow: preferredMaintenanceWindow,
				Port: port,
				StorageEncrypted: storageEncrypted,
				KmsKeyId: kmsKeyId,
				Tags: tags,
			});

			// Send the command
			const response = await rdsClient.send(command);

			return {
				cluster: response.DBCluster,
			};
		} catch (error) {
			console.error(
				`Error creating RDS DB cluster ${dbClusterIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

const createDbClusterService = new CreateDbClusterService();

export default new BaseService(
	createDbClusterService.toolName,
	createDbClusterService.description,
	createDbClusterService.createDbClusterInput,
	createDbClusterService.createDbClusterZodInput,
	createDbClusterService.createDbCluster,
);
