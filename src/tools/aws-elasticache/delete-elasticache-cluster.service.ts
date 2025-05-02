import { ElastiCache } from "aws-sdk";
import { DeleteElastiCacheClusterParams } from "./delete-elasticache-cluster";

export class DeleteElastiCacheClusterService {
	async execute(params: DeleteElastiCacheClusterParams): Promise<any> {
		const { region, clusterId, finalSnapshotId } = params;

		// Initialize the ElastiCache client with the specified region
		const elastiCache = new ElastiCache({ region });

		// Build the request parameters
		const requestParams: ElastiCache.DeleteCacheClusterMessage = {
			CacheClusterId: clusterId,
		};

		// Add final snapshot ID if provided
		if (finalSnapshotId) {
			requestParams.FinalSnapshotIdentifier = finalSnapshotId;
		}

		try {
			// Call the AWS SDK to delete the ElastiCache cluster
			const response = await elastiCache
				.deleteCacheCluster(requestParams)
				.promise();

			// Return the deleted cluster information
			return {
				success: true,
				cluster: {
					clusterId: response.CacheCluster?.CacheClusterId,
					status: response.CacheCluster?.CacheClusterStatus,
					engine: response.CacheCluster?.Engine,
					engineVersion: response.CacheCluster?.EngineVersion,
					nodeType: response.CacheCluster?.CacheNodeType,
					numNodes: response.CacheCluster?.NumCacheNodes,
				},
				region,
				message: `ElastiCache cluster '${clusterId}' deletion initiated successfully.`,
			};
		} catch (error) {
			console.error(
				`Error deleting ElastiCache cluster '${clusterId}':`,
				error,
			);
			throw error;
		}
	}
}
