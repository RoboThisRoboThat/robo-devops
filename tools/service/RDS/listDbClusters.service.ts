import { RDSClient, DescribeDBClustersCommand } from "@aws-sdk/client-rds";
import { z } from "zod";
import BaseService from "../base.service";

class ListDbClustersService {
	/**
	 * Retrieves and displays a detailed list of RDS DB clusters (Aurora)
	 * @param region The AWS region to use
	 * @param outputFormat Optional output format
	 * @returns Promise containing array of RDS DB clusters with their details
	 */

	toolName = "list-db-clusters";
	description =
		"Retrieves and displays a detailed list of RDS DB clusters (Aurora)";

	listDbClustersInput = {
		region: z.string().describe("Specifies the AWS region to query"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Specifies the output format (`text`, `json`, `table`)"),
	};

	listDbClustersZodInput = z.object(this.listDbClustersInput);

	async listDbClusters({
		region,
		outputFormat = "text",
	}: {
		region: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create a new RDSClient for the provided region
			const rdsClient = new RDSClient({ region });

			// Create the command to describe DB clusters
			const command = new DescribeDBClustersCommand({});

			// Send the command
			const response = await rdsClient.send(command);

			// Extract and format the relevant information
			const clusters = (response.DBClusters || []).map((cluster) => ({
				DBClusterIdentifier: cluster.DBClusterIdentifier,
				Engine: cluster.Engine,
				EngineVersion: cluster.EngineVersion,
				Status: cluster.Status,
				Endpoint: cluster.Endpoint,
				ReaderEndpoint: cluster.ReaderEndpoint,
				MultiAZ: cluster.MultiAZ,
				DBClusterMembers: cluster.DBClusterMembers,
				AvailabilityZones: cluster.AvailabilityZones,
				DBClusterParameterGroup: cluster.DBClusterParameterGroup,
				DBSubnetGroup: cluster.DBSubnetGroup,
				VpcSecurityGroups: cluster.VpcSecurityGroups,
			}));

			return { clusters };
		} catch (error) {
			console.error("Error listing RDS DB clusters:", error);
			throw error;
		}
	}
}

const listDbClustersService = new ListDbClustersService();

export default new BaseService(
	listDbClustersService.toolName,
	listDbClustersService.description,
	listDbClustersService.listDbClustersInput,
	listDbClustersService.listDbClustersZodInput,
	listDbClustersService.listDbClusters,
);
