import {
	RDSClient,
	DescribeDBInstancesCommand,
	DBInstance,
} from "@aws-sdk/client-rds";
import { z } from "zod";

class ListDbInstancesService {
	/**
	 * Retrieves and displays a detailed list of RDS DB instances
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param outputFormat Optional output format
	 * @returns Promise containing array of RDS DB instances with their details
	 */

	toolName = "list-db-instances";
	description = "Retrieves and displays a detailed list of RDS DB instances";

	listDbInstancesInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`)",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe(
				"Specifies the desired output format. Supported values: `text` (default, human-readable text output), `json` (JSON formatted output), or `table` (formatted table output)",
			),
	};

	listDbInstancesZodInput = z.object(this.listDbInstancesInput);

	async listDbInstances({
		region,
		outputFormat = "text",
	}: {
		region: string;
		outputFormat?: "text" | "json" | "table";
	}): Promise<{
		instances: {
			DBInstanceIdentifier: string | undefined;
			DBInstanceClass: string | undefined;
			Engine: string | undefined;
			DBInstanceStatus: string | undefined;
			Endpoint?: {
				Address?: string;
				Port?: number;
			};
			AvailabilityZone?: string;
			AllocatedStorage?: number;
			DBName?: string;
			MasterUsername?: string;
		}[];
	}> {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to describe DB instances
			const command = new DescribeDBInstancesCommand({});

			// Send the command
			const response = await rdsClient.send(command);

			// Extract and format the relevant information
			const instances = (response.DBInstances || []).map((instance) => ({
				DBInstanceIdentifier: instance.DBInstanceIdentifier,
				DBInstanceClass: instance.DBInstanceClass,
				Engine: instance.Engine,
				DBInstanceStatus: instance.DBInstanceStatus,
				Endpoint: instance.Endpoint
					? {
							Address: instance.Endpoint.Address,
							Port: instance.Endpoint.Port,
						}
					: undefined,
				AvailabilityZone: instance.AvailabilityZone,
				AllocatedStorage: instance.AllocatedStorage,
				DBName: instance.DBName,
				MasterUsername: instance.MasterUsername,
			}));

			return { instances };
		} catch (error) {
			console.error("Error listing RDS DB instances:", error);
			throw error;
		}
	}
}

export default new ListDbInstancesService();
