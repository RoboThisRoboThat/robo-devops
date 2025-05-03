import {
	ElastiCacheClient,
	DescribeCacheClustersCommand,
} from "@aws-sdk/client-elasticache";
import { z } from "zod";
import BaseService from "../base.service";

class DescribeCacheClustersService {
	/**
	 * Retrieves a detailed list of ElastiCache clusters
	 * @param region Specifies the AWS region to query
	 * @param cacheClusterId Optional cache cluster ID to filter results
	 * @param showCacheNodeInfo If true, includes detailed information about each cache node
	 * @param outputFormat Optional output format (text, json, table)
	 * @returns Promise containing array of ElastiCache clusters
	 */

	toolName = "describe-cache-clusters";
	description =
		"Retrieves a detailed list of ElastiCache clusters from the specified AWS region";

	describeCacheClustersInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region to query (e.g., us-east-1, ap-southeast-2)",
			),
		cacheClusterId: z
			.string()
			.optional()
			.describe(
				"Filters the results to include only the cluster with the specified ID",
			),
		showCacheNodeInfo: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"If true, includes detailed information about each cache node in the cluster",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the desired output format"),
	};

	describeCacheClustersZodInput = z.object(this.describeCacheClustersInput);

	async describeCacheClusters({
		region,
		cacheClusterId,
		showCacheNodeInfo = false,
		outputFormat,
	}: {
		region: string;
		cacheClusterId?: string;
		showCacheNodeInfo?: boolean;
		outputFormat?: "text" | "json" | "table";
	}): Promise<
		{
			cacheClusterId: string | null;
			cacheClusterStatus: string | null;
			engine: string | null;
			engineVersion: string | null;
			cacheNodeType: string | null;
			numCacheNodes: number | null;
			preferredAvailabilityZone: string | null;
			cacheNodes?: Array<{
				cacheNodeId: string | null;
				cacheNodeStatus: string | null;
				endpoint?: {
					address: string | null;
					port: number | null;
				} | null;
			}> | null;
		}[]
	> {
		try {
			// Create a new ElastiCacheClient for the specified region
			const elasticacheClient = new ElastiCacheClient({ region });

			// Set up the command parameters
			const params: any = {
				ShowCacheNodeInfo: showCacheNodeInfo,
			};

			// Add cache cluster ID if provided
			if (cacheClusterId) {
				params.CacheClusterId = cacheClusterId;
			}

			const command = new DescribeCacheClustersCommand(params);
			const response = await elasticacheClient.send(command);

			// Process and format the response
			const clusters = response.CacheClusters || [];

			return clusters.map((cluster) => {
				const result: any = {
					cacheClusterId: cluster.CacheClusterId || null,
					cacheClusterStatus: cluster.CacheClusterStatus || null,
					engine: cluster.Engine || null,
					engineVersion: cluster.EngineVersion || null,
					cacheNodeType: cluster.CacheNodeType || null,
					numCacheNodes: cluster.NumCacheNodes || null,
					preferredAvailabilityZone: cluster.PreferredAvailabilityZone || null,
				};

				// Add cache nodes information if requested
				if (showCacheNodeInfo && cluster.CacheNodes) {
					result.cacheNodes = cluster.CacheNodes.map((node) => ({
						cacheNodeId: node.CacheNodeId || null,
						cacheNodeStatus: node.CacheNodeStatus || null,
						endpoint: node.Endpoint
							? {
									address: node.Endpoint.Address || null,
									port: node.Endpoint.Port || null,
								}
							: null,
					}));
				}

				return result;
			});
		} catch (error) {
			console.error("Error describing ElastiCache clusters:", error);
			throw error;
		}
	}
}

const describeCacheClustersService = new DescribeCacheClustersService();

export default new BaseService(
	describeCacheClustersService.toolName,
	describeCacheClustersService.description,
	describeCacheClustersService.describeCacheClustersInput,
	describeCacheClustersService.describeCacheClustersZodInput,
	describeCacheClustersService.describeCacheClusters,
);
