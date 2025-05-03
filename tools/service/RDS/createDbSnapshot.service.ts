import {
	RDSClient,
	CreateDBSnapshotCommand,
	type Tag,
	type DBSnapshot,
} from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";

interface CreateDbSnapshotInput {
	region: string;
	dbInstanceIdentifier: string;
	dbSnapshotIdentifier: string;
	tags?: Tag[];
}

interface CreateDbSnapshotOutput {
	snapshot: DBSnapshot | undefined;
}

class CreateDbSnapshotService {
	/**
	 * Creates a snapshot of a specified RDS DB instance
	 */

	toolName = "create-db-snapshot";
	description = "Creates a snapshot of a specified RDS DB instance";

	inputSchema = {
		region: z
			.string()
			.describe("Specifies the AWS region where the DB instance resides"),
		dbInstanceIdentifier: z
			.string()
			.describe("The unique identifier of the source DB instance"),
		dbSnapshotIdentifier: z
			.string()
			.describe("The identifier for the new DB snapshot"),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe(
				"A list of key-value pairs to assign as tags to the new DB snapshot",
			),
	};

	zodSchema = z.object(this.inputSchema);

	async execute({
		region,
		dbInstanceIdentifier,
		dbSnapshotIdentifier,
		tags,
	}: CreateDbSnapshotInput): Promise<CreateDbSnapshotOutput> {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to create a DB snapshot
			const command = new CreateDBSnapshotCommand({
				DBInstanceIdentifier: dbInstanceIdentifier,
				DBSnapshotIdentifier: dbSnapshotIdentifier,
				Tags: tags,
			});

			// Send the command
			const response = await rdsClient.send(command);

			return {
				snapshot: response.DBSnapshot,
			};
		} catch (error) {
			console.error(
				`Error creating RDS DB snapshot for ${dbInstanceIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

const createDbSnapshotService = new CreateDbSnapshotService();

export default new BaseService(
	createDbSnapshotService.toolName,
	createDbSnapshotService.description,
	createDbSnapshotService.inputSchema,
	createDbSnapshotService.zodSchema,
	createDbSnapshotService.execute,
);
