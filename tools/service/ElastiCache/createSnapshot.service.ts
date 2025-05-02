import {
	ElastiCacheClient,
	CreateSnapshotCommand,
	type Tag,
} from "@aws-sdk/client-elasticache";
import { z } from "zod";

class CreateSnapshotService {
	/**
	 * Creates a manual snapshot of a cache cluster or replication group
	 * @param region Specifies the AWS region
	 * @param snapshotName The identifier for the snapshot
	 * @param cacheClusterId Optional ID of the cache cluster to snapshot
	 * @param replicationGroupId Optional ID of the replication group to snapshot
	 * @param tags Optional tags to assign to the snapshot
	 * @returns Promise containing details of the created snapshot
	 */

	toolName = "create-snapshot";
	description =
		"Creates a manual snapshot of an ElastiCache cache cluster or replication group";

	createSnapshotInput = {
		region: z.string().describe("Specifies the AWS region (e.g., us-east-1)"),
		snapshotName: z.string().describe("The identifier for the snapshot"),
		cacheClusterId: z
			.string()
			.optional()
			.describe("The ID of the cache cluster to snapshot"),
		replicationGroupId: z
			.string()
			.optional()
			.describe("The ID of the replication group to snapshot"),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe("Tags to assign to the snapshot"),
	};

	createSnapshotZodInput = z
		.object(this.createSnapshotInput)
		.refine(
			(data) =>
				(!!data.cacheClusterId || !!data.replicationGroupId) &&
				!(!!data.cacheClusterId && !!data.replicationGroupId),
			{
				message:
					"Exactly one of cacheClusterId or replicationGroupId must be provided",
			},
		);

	async createSnapshot({
		region,
		snapshotName,
		cacheClusterId,
		replicationGroupId,
		tags,
	}: {
		region: string;
		snapshotName: string;
		cacheClusterId?: string;
		replicationGroupId?: string;
		tags?: { Key: string; Value: string }[];
	}): Promise<{
		snapshotName: string | null;
		source: string | null;
		nodeSnapshots: Array<{
			cacheNodeId: string | null;
			cacheSize: string | null;
		}> | null;
		creationSuccess: boolean;
	}> {
		try {
			// Validate that exactly one of cacheClusterId or replicationGroupId is provided
			if (!cacheClusterId && !replicationGroupId) {
				throw new Error(
					"Either cacheClusterId or replicationGroupId must be provided",
				);
			}
			if (cacheClusterId && replicationGroupId) {
				throw new Error(
					"Only one of cacheClusterId or replicationGroupId should be provided",
				);
			}

			// Create a new ElastiCacheClient for the specified region
			const elasticacheClient = new ElastiCacheClient({ region });

			// Set up command parameters
			const params: Record<string, unknown> = {
				SnapshotName: snapshotName,
			};

			// Add source identifier based on what was provided
			if (cacheClusterId) {
				params.CacheClusterId = cacheClusterId;
			} else if (replicationGroupId) {
				params.ReplicationGroupId = replicationGroupId;
			}

			// Add tags if provided
			if (tags && tags.length > 0) {
				params.Tags = tags;
			}

			const command = new CreateSnapshotCommand(params);
			const response = await elasticacheClient.send(command);

			const snapshot = response.Snapshot;
			if (!snapshot) {
				throw new Error(
					"Failed to create snapshot, no snapshot details returned",
				);
			}

			return {
				snapshotName: snapshot.SnapshotName || null,
				source: snapshot.CacheClusterId || snapshot.ReplicationGroupId || null,
				nodeSnapshots:
					snapshot.NodeSnapshots?.map((nodeSnapshot) => ({
						cacheNodeId: nodeSnapshot.CacheNodeId || null,
						cacheSize: nodeSnapshot.CacheSize || null,
					})) || null,
				creationSuccess: true,
			};
		} catch (error) {
			console.error("Error creating ElastiCache snapshot:", error);
			throw error;
		}
	}
}

export default new CreateSnapshotService();
