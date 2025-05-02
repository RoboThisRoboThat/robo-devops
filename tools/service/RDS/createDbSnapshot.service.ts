import {
	RDSClient,
	CreateDBSnapshotCommand,
	type Tag,
} from "@aws-sdk/client-rds";
import { z } from "zod";

class CreateDbSnapshotService {
	/**
	 * Creates a snapshot of a specified RDS DB instance
	 * @param region The AWS region to use
	 * @param dbInstanceIdentifier The unique identifier of the source DB instance
	 * @param dbSnapshotIdentifier The identifier for the new DB snapshot
	 * @param tags Optional tags to apply to the new DB snapshot
	 * @returns Promise containing information about the created snapshot
	 */

	toolName = "create-db-snapshot";
	description = "Creates a snapshot of a specified RDS DB instance";

	createDbSnapshotInput = {
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

	createDbSnapshotZodInput = z.object(this.createDbSnapshotInput);

	async createDbSnapshot({
		region,
		dbInstanceIdentifier,
		dbSnapshotIdentifier,
		tags,
	}: {
		region: string;
		dbInstanceIdentifier: string;
		dbSnapshotIdentifier: string;
		tags?: Tag[];
	}) {
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

export default new CreateDbSnapshotService();
