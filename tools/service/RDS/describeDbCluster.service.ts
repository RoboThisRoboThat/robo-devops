import {
	RDSClient,
	DescribeDBClustersCommand,
	DBCluster,
} from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";

class DescribeDbClusterService {
	/**
	 * Displays detailed information about a specific RDS DB cluster (Aurora)
	 * @param region The AWS region to use
	 * @param dbClusterIdentifier The identifier of the DB cluster to describe
	 * @param outputFormat Optional output format
	 * @returns Promise containing detailed information about the specified DB cluster
	 */

	toolName = "describe-db-cluster";
	description =
		"Displays detailed information about a specific RDS DB cluster (Aurora)";

	describeDbClusterInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the DB cluster resides"),
		dbClusterIdentifier: z
			.string()
			.describe(
				"Specifies the unique identifier for the DB cluster (e.g., `my-aurora-cluster`)",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Specifies the output format (`text`, `json`, `table`)"),
	};

	describeDbClusterZodInput = z.object(this.describeDbClusterInput);

	async describeDbCluster({
		region,
		dbClusterIdentifier,
		outputFormat = "text",
	}: {
		region: string;
		dbClusterIdentifier: string;
		outputFormat?: "text" | "json" | "table";
	}): Promise<{
		cluster: DBCluster | null;
	}> {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to describe the specific DB cluster
			const command = new DescribeDBClustersCommand({
				DBClusterIdentifier: dbClusterIdentifier,
			});

			// Send the command
			const response = await rdsClient.send(command);

			// Check if we got a response with DB clusters
			if (!response.DBClusters || response.DBClusters.length === 0) {
				return { cluster: null };
			}

			// Return the first (and only) cluster matching the identifier
			return {
				cluster: response.DBClusters[0],
			};
		} catch (error) {
			console.error(
				`Error describing RDS DB cluster ${dbClusterIdentifier}:`,
				error,
			);
			throw error;
		}
	}
}

const describeDbClusterService = new DescribeDbClusterService();

export default new BaseService(
	describeDbClusterService.toolName,
	describeDbClusterService.description,
	describeDbClusterService.describeDbClusterInput,
	describeDbClusterService.describeDbClusterZodInput,
	describeDbClusterService.describeDbCluster,
);
