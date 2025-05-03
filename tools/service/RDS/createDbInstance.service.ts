import {
	RDSClient,
	CreateDBInstanceCommand,
	type Tag,
} from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";

class CreateDbInstanceService {
	/**
	 * Creates a new RDS DB instance with specified configurations
	 * @param region The AWS region to use
	 * @param dbInstanceIdentifier The unique identifier for the DB instance
	 * @param dbInstanceClass The compute and memory capacity of the DB instance
	 * @param engine The database engine to use
	 * @param allocatedStorage The size of the database storage in GiB
	 * @param masterUsername The username for the master user account
	 * @param masterPassword The password for the master user account
	 * @param other Optional parameters as described in the RDS API
	 * @returns Promise containing information about the created DB instance
	 */

	toolName = "create-db-instance";
	description = "Creates a new RDS DB instance with specified configurations";

	createDbInstanceInput = {
		region: z
			.string()
			.describe("Specifies the AWS region in which to create the DB instance"),
		dbInstanceIdentifier: z
			.string()
			.describe(
				"The unique identifier for the DB instance (e.g., `new-database`)",
			),
		dbInstanceClass: z
			.string()
			.describe(
				"The compute and memory capacity of the DB instance (e.g., `db.t2.micro`, `db.m5.large`)",
			),
		engine: z
			.string()
			.describe(
				"The name of the database engine to be used for this DB instance (e.g., `mysql`, `postgres`, `oracle-ee`, `sqlserver-ex`)",
			),
		engineVersion: z
			.string()
			.optional()
			.describe("The version number of the database engine to use"),
		allocatedStorage: z
			.number()
			.int()
			.describe("The size of the database storage to allocate (in GiB)"),
		dbName: z
			.string()
			.optional()
			.describe(
				"The name of the database to create when the DB instance is created. Not applicable for all engines",
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
				"A list of VPC security group IDs to associate with the DB instance",
			),
		availabilityZone: z
			.string()
			.optional()
			.describe(
				"The Availability Zone (AZ) in which to create the DB instance",
			),
		dbSubnetGroupName: z
			.string()
			.optional()
			.describe(
				"The name of the DB subnet group to use for the DB instance. Required if the DB instance will be in a VPC",
			),
		publiclyAccessible: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Specifies whether the DB instance can be accessed from outside the VPC. Boolean value (`true` or `false`)",
			),
		multiAZ: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Specifies if the DB instance should be created as a Multi-AZ deployment for high availability. Boolean value",
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
		storageType: z
			.string()
			.optional()
			.default("gp2")
			.describe(
				"The storage type to be associated with the DB instance (`standard`, `gp2`, `io1`)",
			),
		iops: z
			.number()
			.int()
			.optional()
			.describe(
				"The number of Provisioned IOPS (PIOPS) if `storage-type` is `io1`",
			),
		licenseModel: z.string().optional().describe("The licensing model to use"),
		characterSetName: z
			.string()
			.optional()
			.describe("The character set for the database"),
		collation: z.string().optional().describe("The collation for the database"),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe(
				"A list of key-value pairs to assign as tags to the new DB instance",
			),
	};

	createDbInstanceZodInput = z.object(this.createDbInstanceInput);

	async createDbInstance({
		region,
		dbInstanceIdentifier,
		dbInstanceClass,
		engine,
		engineVersion,
		allocatedStorage,
		dbName,
		masterUsername,
		masterPassword,
		vpcSecurityGroupIds,
		availabilityZone,
		dbSubnetGroupName,
		publiclyAccessible = false,
		multiAZ = false,
		backupRetentionPeriod,
		preferredBackupWindow,
		preferredMaintenanceWindow,
		port,
		storageType = "gp2",
		iops,
		licenseModel,
		characterSetName,
		collation,
		tags,
	}: {
		region: string;
		dbInstanceIdentifier: string;
		dbInstanceClass: string;
		engine: string;
		engineVersion?: string;
		allocatedStorage: number;
		dbName?: string;
		masterUsername: string;
		masterPassword: string;
		vpcSecurityGroupIds?: string[];
		availabilityZone?: string;
		dbSubnetGroupName?: string;
		publiclyAccessible?: boolean;
		multiAZ?: boolean;
		backupRetentionPeriod?: number;
		preferredBackupWindow?: string;
		preferredMaintenanceWindow?: string;
		port?: number;
		storageType?: string;
		iops?: number;
		licenseModel?: string;
		characterSetName?: string;
		collation?: string;
		tags?: Tag[];
	}) {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to create a new DB instance
			const command = new CreateDBInstanceCommand({
				DBInstanceIdentifier: dbInstanceIdentifier,
				DBInstanceClass: dbInstanceClass,
				Engine: engine,
				EngineVersion: engineVersion,
				AllocatedStorage: allocatedStorage,
				DBName: dbName,
				MasterUsername: masterUsername,
				MasterUserPassword: masterPassword,
				VpcSecurityGroupIds: vpcSecurityGroupIds,
				AvailabilityZone: availabilityZone,
				DBSubnetGroupName: dbSubnetGroupName,
				PubliclyAccessible: publiclyAccessible,
				MultiAZ: multiAZ,
				BackupRetentionPeriod: backupRetentionPeriod,
				PreferredBackupWindow: preferredBackupWindow,
				PreferredMaintenanceWindow: preferredMaintenanceWindow,
				Port: port,
				StorageType: storageType,
				Iops: iops,
				LicenseModel: licenseModel,
				CharacterSetName: characterSetName,
				Tags: tags,
			});

			// Send the command
			const response = await rdsClient.send(command);

			return {
				instance: response.DBInstance,
			};
		} catch (error) {
			console.error(
				`Error creating RDS DB instance ${dbInstanceIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

const createDbInstanceService = new CreateDbInstanceService();

export default new BaseService(
	createDbInstanceService.toolName,
	createDbInstanceService.description,
	createDbInstanceService.createDbInstanceInput,
	createDbInstanceService.createDbInstanceZodInput,
	createDbInstanceService.createDbInstance,
);
