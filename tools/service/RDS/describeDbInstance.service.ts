import {
	RDSClient,
	DescribeDBInstancesCommand,
	type DBInstance,
} from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";
class DescribeDbInstanceService {
	/**
	 * Displays detailed information about a specific RDS DB instance
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param dbInstanceIdentifier The identifier of the DB instance to describe
	 * @param outputFormat Optional output format
	 * @returns Promise containing detailed information about the specified DB instance
	 */

	toolName = "describe-db-instance";
	description =
		"Displays detailed information about a specific RDS DB instance";

	describeDbInstanceInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the DB instance resides"),
		dbInstanceIdentifier: z
			.string()
			.describe(
				"Specifies the unique identifier for the DB instance (e.g., `mydbinstance`)",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Specifies the output format (`text`, `json`, `table`)"),
	};

	describeDbInstanceZodInput = z.object(this.describeDbInstanceInput);

	async describeDbInstance({
		region,
		dbInstanceIdentifier,
		outputFormat = "text",
	}: {
		region: string;
		dbInstanceIdentifier: string;
		outputFormat?: "text" | "json" | "table";
	}): Promise<{
		instance: DBInstance | null;
	}> {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to describe the specific DB instance
			const command = new DescribeDBInstancesCommand({
				DBInstanceIdentifier: dbInstanceIdentifier,
			});

			// Send the command
			const response = await rdsClient.send(command);

			// Check if we got a response with DB instances
			if (!response.DBInstances || response.DBInstances.length === 0) {
				return { instance: null };
			}

			// Return the first (and only) instance matching the identifier
			return {
				instance: response.DBInstances[0],
			};
		} catch (error) {
			console.error(
				`Error describing RDS DB instance ${dbInstanceIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

const describeDbInstanceService = new DescribeDbInstanceService();

export default new BaseService(
	describeDbInstanceService.toolName,
	describeDbInstanceService.description,
	describeDbInstanceService.describeDbInstanceInput,
	describeDbInstanceService.describeDbInstanceZodInput,
	describeDbInstanceService.describeDbInstance,
);
