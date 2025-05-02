import {
	ElastiCacheClient,
	DeleteCacheClusterCommand,
} from "@aws-sdk/client-elasticache";
import { z } from "zod";

class DeleteCacheClusterService {
	/**
	 * Deletes a specified ElastiCache cluster
	 * @param region Specifies the AWS region where the cluster resides
	 * @param cacheClusterId The unique identifier for the cache cluster to delete
	 * @param finalSnapshotIdentifier Optional identifier for a final snapshot
	 * @param showProgress If true, displays deletion progress information
	 * @returns Promise containing details of the deleted cache cluster
	 */

	toolName = "delete-cache-cluster";
	description =
		"Deletes a specified ElastiCache cluster in the specified AWS region";

	deleteCacheClusterInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region where the cluster resides (e.g., us-east-1)",
			),
		cacheClusterId: z
			.string()
			.describe("The unique identifier for the cache cluster to delete"),
		finalSnapshotIdentifier: z
			.string()
			.optional()
			.describe(
				"The identifier of the final snapshot to be created before the cache cluster is deleted",
			),
		showProgress: z
			.boolean()
			.optional()
			.default(false)
			.describe("If true, displays the progress of the deletion"),
	};

	deleteCacheClusterZodInput = z.object(this.deleteCacheClusterInput);

	async deleteCacheCluster({
		region,
		cacheClusterId,
		finalSnapshotIdentifier,
		showProgress = false,
	}: {
		region: string;
		cacheClusterId: string;
		finalSnapshotIdentifier?: string;
		showProgress?: boolean;
	}): Promise<{
		cacheClusterId: string | null;
		cacheClusterStatus: string | null;
		deletionSuccess: boolean;
	}> {
		try {
			// Create a new ElastiCacheClient for the specified region
			const elasticacheClient = new ElastiCacheClient({ region });

			// Set up command parameters
			const params: Record<string, unknown> = {
				CacheClusterId: cacheClusterId,
			};

			// Add final snapshot identifier if provided
			if (finalSnapshotIdentifier) {
				params.FinalSnapshotIdentifier = finalSnapshotIdentifier;
			}

			const command = new DeleteCacheClusterCommand(params);
			const response = await elasticacheClient.send(command);

			const cluster = response.CacheCluster;

			// Handle progress tracking if requested
			if (showProgress && cluster) {
				console.log(`Deletion of cache cluster ${cacheClusterId} initiated.`);
				console.log(`Current status: ${cluster.CacheClusterStatus}`);
				// In a real implementation, you might want to poll for status updates
			}

			return {
				cacheClusterId: cluster?.CacheClusterId || null,
				cacheClusterStatus: cluster?.CacheClusterStatus || null,
				deletionSuccess: !!cluster,
			};
		} catch (error) {
			console.error("Error deleting ElastiCache cluster:", error);
			throw error;
		}
	}
}

export default new DeleteCacheClusterService();
