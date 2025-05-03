import {
	ElastiCacheClient,
	DeleteReplicationGroupCommand,
} from "@aws-sdk/client-elasticache";
import { z } from "zod";
import BaseService from "../base.service";

class DeleteReplicationGroupService {
	/**
	 * Deletes a specified ElastiCache replication group (for Redis)
	 * @param region Specifies the AWS region where the replication group resides
	 * @param replicationGroupId The unique identifier for the replication group to delete
	 * @param finalSnapshotIdentifier Optional identifier for a final snapshot
	 * @param retainPrimaryCluster If true, only removes replicas, retaining the primary
	 * @returns Promise containing details of the deleted replication group
	 */

	toolName = "delete-replication-group";
	description =
		"Deletes a specified ElastiCache replication group (for Redis) in the specified AWS region";

	deleteReplicationGroupInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region where the replication group resides (e.g., us-east-1)",
			),
		replicationGroupId: z
			.string()
			.describe("The unique identifier for the replication group to delete"),
		finalSnapshotIdentifier: z
			.string()
			.optional()
			.describe(
				"The identifier of the final snapshot to be created before the replication group is deleted",
			),
		retainPrimaryCluster: z
			.boolean()
			.optional()
			.default(false)
			.describe("If true, only removes the replicas, retaining the primary"),
	};

	deleteReplicationGroupZodInput = z.object(this.deleteReplicationGroupInput);

	async deleteReplicationGroup({
		region,
		replicationGroupId,
		finalSnapshotIdentifier,
		retainPrimaryCluster = false,
	}: {
		region: string;
		replicationGroupId: string;
		finalSnapshotIdentifier?: string;
		retainPrimaryCluster?: boolean;
	}): Promise<{
		replicationGroupId: string | null;
		status: string | null;
		deletionSuccess: boolean;
	}> {
		try {
			// Create a new ElastiCacheClient for the specified region
			const elasticacheClient = new ElastiCacheClient({ region });

			// Set up command parameters
			const params: Record<string, unknown> = {
				ReplicationGroupId: replicationGroupId,
				RetainPrimaryCluster: retainPrimaryCluster,
			};

			// Add final snapshot identifier if provided
			if (finalSnapshotIdentifier) {
				params.FinalSnapshotIdentifier = finalSnapshotIdentifier;
			}

			const command = new DeleteReplicationGroupCommand(params);
			const response = await elasticacheClient.send(command);

			const group = response.ReplicationGroup;

			return {
				replicationGroupId: group?.ReplicationGroupId || null,
				status: group?.Status || null,
				deletionSuccess: !!group,
			};
		} catch (error) {
			console.error("Error deleting ElastiCache replication group:", error);
			throw error;
		}
	}
}

const deleteReplicationGroupService = new DeleteReplicationGroupService();

export default new BaseService(
	deleteReplicationGroupService.toolName,
	deleteReplicationGroupService.description,
	deleteReplicationGroupService.deleteReplicationGroupInput,
	deleteReplicationGroupService.deleteReplicationGroupZodInput,
	deleteReplicationGroupService.deleteReplicationGroup,
);
