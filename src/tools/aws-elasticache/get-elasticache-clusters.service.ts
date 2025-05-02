import { ElastiCache } from "aws-sdk";
import { GetElastiCacheClustersParams } from "./get-elasticache-clusters";

export class GetElastiCacheClustersService {
	async execute(params: GetElastiCacheClustersParams): Promise<any> {
		const { region, filters, maxResults, showNodeInfo } = params;

		// Initialize the ElastiCache client with the specified region
		const elastiCache = new ElastiCache({ region });

		// Build the request parameters
		const requestParams: ElastiCache.DescribeCacheClustersMessage = {
			MaxRecords: maxResults,
			ShowCacheNodeInfo: showNodeInfo,
		};

		// Add filters if provided
		if (filters && filters.length > 0) {
			// ElastiCache doesn't support filters in the same way as EC2,
			// so we'll need to handle them differently
			// For now, we'll focus on the cache-cluster-id filter which is common
			const clusterIdFilter = filters.find(
				(f) => f.Name === "cache-cluster-id",
			);
			if (clusterIdFilter && clusterIdFilter.Values.length > 0) {
				requestParams.CacheClusterId = clusterIdFilter.Values[0];
			}
		}

		try {
			// Call the AWS SDK to get ElastiCache clusters
			const response = await elastiCache
				.describeCacheClusters(requestParams)
				.promise();

			// Return the response with formatted clusters
			return {
				clusters:
					response.CacheClusters?.map((cluster) => ({
						clusterId: cluster.CacheClusterId,
						status: cluster.CacheClusterStatus,
						engine: cluster.Engine,
						engineVersion: cluster.EngineVersion,
						nodeType: cluster.CacheNodeType,
						numNodes: cluster.NumCacheNodes,
						pendingModifications: cluster.PendingModifiedValues,
						created: cluster.CacheClusterCreateTime,
						securityGroups: cluster.SecurityGroups?.map(
							(sg) => sg.SecurityGroupId,
						),
						subnetGroupName: cluster.CacheSubnetGroupName,
						nodes: showNodeInfo ? cluster.CacheNodes : undefined,
					})) || [],
				region,
			};
		} catch (error) {
			console.error("Error fetching ElastiCache clusters:", error);
			throw error;
		}
	}
}
