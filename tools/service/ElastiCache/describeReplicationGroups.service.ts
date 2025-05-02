import {
	ElastiCacheClient,
	DescribeReplicationGroupsCommand,
} from "@aws-sdk/client-elasticache";
import { z } from "zod";

class DescribeReplicationGroupsService {
	/**
	 * Retrieves a detailed list of ElastiCache replication groups (for Redis)
	 * @param region Specifies the AWS region to query
	 * @param replicationGroupId Optional replication group ID to filter results
	 * @param outputFormat Optional output format (text, json, table)
	 * @returns Promise containing array of ElastiCache replication groups
	 */

	toolName = "describe-replication-groups";
	description =
		"Retrieves a detailed list of ElastiCache replication groups (for Redis) from the specified AWS region";

	describeReplicationGroupsInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region to query (e.g., us-east-1, ap-southeast-2)",
			),
		replicationGroupId: z
			.string()
			.optional()
			.describe(
				"Filters the results to include only the replication group with the specified ID",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the desired output format"),
	};

	describeReplicationGroupsZodInput = z.object(
		this.describeReplicationGroupsInput,
	);

	async describeReplicationGroups({
		region,
		replicationGroupId,
		outputFormat,
	}: {
		region: string;
		replicationGroupId?: string;
		outputFormat?: "text" | "json" | "table";
	}): Promise<
		{
			replicationGroupId: string | null;
			description: string | null;
			status: string | null;
			clusterEnabled: boolean | null;
			memberClusters: string[] | null;
			nodeGroups: Array<{
				nodeGroupId: string | null;
				status: string | null;
				primaryEndpoint?: {
					address: string | null;
					port: number | null;
				} | null;
				readerEndpoint?: {
					address: string | null;
					port: number | null;
				} | null;
				nodes: Array<{
					cacheClusterId: string | null;
					cacheNodeId: string | null;
					role: string | null;
					status: string | null;
				}> | null;
			}> | null;
		}[]
	> {
		try {
			// Create a new ElastiCacheClient for the specified region
			const elasticacheClient = new ElastiCacheClient({ region });

			// Set up the command parameters
			const params: Record<string, unknown> = {};

			// Add replication group ID if provided
			if (replicationGroupId) {
				params.ReplicationGroupId = replicationGroupId;
			}

			const command = new DescribeReplicationGroupsCommand(params);
			const response = await elasticacheClient.send(command);

			// Process and format the response
			const replicationGroups = response.ReplicationGroups || [];

			return replicationGroups.map((group) => {
				const result: any = {
					replicationGroupId: group.ReplicationGroupId || null,
					description: group.Description || null,
					status: group.Status || null,
					clusterEnabled: group.ClusterEnabled || null,
					memberClusters: group.MemberClusters || null,
				};

				// Process node groups if available
				if (group.NodeGroups) {
					result.nodeGroups = group.NodeGroups.map((nodeGroup) => {
						const nodeGroupResult: any = {
							nodeGroupId: nodeGroup.NodeGroupId || null,
							status: nodeGroup.Status || null,
						};

						// Add primary endpoint if available
						if (nodeGroup.PrimaryEndpoint) {
							nodeGroupResult.primaryEndpoint = {
								address: nodeGroup.PrimaryEndpoint.Address || null,
								port: nodeGroup.PrimaryEndpoint.Port || null,
							};
						}

						// Add reader endpoint if available
						if (nodeGroup.ReaderEndpoint) {
							nodeGroupResult.readerEndpoint = {
								address: nodeGroup.ReaderEndpoint.Address || null,
								port: nodeGroup.ReaderEndpoint.Port || null,
							};
						}

						// Process node group members if available
						if (nodeGroup.NodeGroupMembers) {
							nodeGroupResult.nodes = nodeGroup.NodeGroupMembers.map(
								(node) => ({
									cacheClusterId: node.CacheClusterId || null,
									cacheNodeId: node.CacheNodeId || null,
									role: node.CurrentRole || null,
									status: node.CacheClusterStatus || null,
								}),
							);
						} else {
							nodeGroupResult.nodes = null;
						}

						return nodeGroupResult;
					});
				} else {
					result.nodeGroups = null;
				}

				return result;
			});
		} catch (error) {
			console.error("Error describing ElastiCache replication groups:", error);
			throw error;
		}
	}
}

export default new DescribeReplicationGroupsService();
