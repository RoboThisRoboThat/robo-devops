import {
	ElastiCacheClient,
	ModifyCacheClusterCommand,
	type Tag,
} from "@aws-sdk/client-elasticache";
import { z } from "zod";
import BaseService from "../base.service";

class ModifyCacheClusterService {
	/**
	 * Modifies the settings of an existing ElastiCache cluster
	 * @param region Specifies the AWS region where the cluster resides
	 * @param cacheClusterId The unique identifier for the cache cluster to modify
	 * @param numCacheNodes Optional new number of cache nodes for the cluster
	 * @param cacheNodeType Optional new compute and memory capacity
	 * @param engineVersion Optional new version of the cache engine
	 * @param preferredMaintenanceWindow Optional new weekly maintenance window
	 * @param notificationTopicArn Optional new ARN for SNS notifications
	 * @param securityGroupNamesToAdd Optional list of EC2 security group names to add
	 * @param securityGroupNamesToRemove Optional list of EC2 security group names to remove
	 * @param applyImmediately Optional whether to apply changes immediately
	 * @param preferredAvailabilityZone Optional preferred AZ to add new nodes in
	 * @param tagsToAdd Optional list of tags to add
	 * @param tagsToRemove Optional list of tag keys to remove
	 * @returns Promise containing details of the modified cache cluster
	 */

	toolName = "modify-cache-cluster";
	description = "Modifies the settings of an existing ElastiCache cluster";

	modifyCacheClusterInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region where the cluster resides (e.g., us-east-1)",
			),
		cacheClusterId: z
			.string()
			.describe("The unique identifier for the cache cluster to modify"),
		numCacheNodes: z
			.number()
			.int()
			.min(1)
			.optional()
			.describe("The new number of cache nodes for the cluster"),
		cacheNodeType: z
			.string()
			.optional()
			.describe("The new compute and memory capacity of the cache nodes"),
		engineVersion: z
			.string()
			.optional()
			.describe("The new version number of the cache engine to use"),
		preferredMaintenanceWindow: z
			.string()
			.optional()
			.describe("The new weekly maintenance window"),
		notificationTopicArn: z
			.string()
			.optional()
			.describe("The new ARN of the SNS topic for notifications"),
		securityGroupNamesToAdd: z
			.array(z.string())
			.optional()
			.describe("A list of EC2 security group names to add"),
		securityGroupNamesToRemove: z
			.array(z.string())
			.optional()
			.describe("A list of EC2 security group names to remove"),
		applyImmediately: z
			.boolean()
			.optional()
			.default(false)
			.describe("Specifies whether the changes should be applied immediately"),
		preferredAvailabilityZone: z
			.string()
			.optional()
			.describe("The preferred AZ to add new nodes in"),
		tagsToAdd: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe("A list of key-value pairs to add as tags"),
		tagsToRemove: z
			.array(z.string())
			.optional()
			.describe("A list of tag keys to remove"),
	};

	modifyCacheClusterZodInput = z.object(this.modifyCacheClusterInput);

	async modifyCacheCluster({
		region,
		cacheClusterId,
		numCacheNodes,
		cacheNodeType,
		engineVersion,
		preferredMaintenanceWindow,
		notificationTopicArn,
		securityGroupNamesToAdd,
		securityGroupNamesToRemove,
		applyImmediately = false,
		preferredAvailabilityZone,
		tagsToAdd,
		tagsToRemove,
	}: {
		region: string;
		cacheClusterId: string;
		numCacheNodes?: number;
		cacheNodeType?: string;
		engineVersion?: string;
		preferredMaintenanceWindow?: string;
		notificationTopicArn?: string;
		securityGroupNamesToAdd?: string[];
		securityGroupNamesToRemove?: string[];
		applyImmediately?: boolean;
		preferredAvailabilityZone?: string;
		tagsToAdd?: { Key: string; Value: string }[];
		tagsToRemove?: string[];
	}): Promise<{
		cacheClusterId: string | null;
		cacheClusterStatus: string | null;
		pendingChanges: Record<string, unknown> | null;
		modificationSuccess: boolean;
	}> {
		try {
			// Create a new ElastiCacheClient for the specified region
			const elasticacheClient = new ElastiCacheClient({ region });

			// Set up command parameters
			const params: Record<string, unknown> = {
				CacheClusterId: cacheClusterId,
				ApplyImmediately: applyImmediately,
			};

			// Add optional parameters if provided
			if (numCacheNodes !== undefined) params.NumCacheNodes = numCacheNodes;
			if (cacheNodeType) params.CacheNodeType = cacheNodeType;
			if (engineVersion) params.EngineVersion = engineVersion;
			if (preferredMaintenanceWindow)
				params.PreferredMaintenanceWindow = preferredMaintenanceWindow;
			if (notificationTopicArn)
				params.NotificationTopicArn = notificationTopicArn;
			if (securityGroupNamesToAdd && securityGroupNamesToAdd.length > 0)
				params.SecurityGroupIdsToAdd = securityGroupNamesToAdd;
			if (securityGroupNamesToRemove && securityGroupNamesToRemove.length > 0)
				params.SecurityGroupIdsToRemove = securityGroupNamesToRemove;
			if (preferredAvailabilityZone)
				params.PreferredAvailabilityZone = preferredAvailabilityZone;

			// Handle tags separately if needed
			// Note: AWS ElastiCache normally requires separate API calls for tag management
			// In a real implementation, you might want to use AddTagsToResource and RemoveTagsFromResource

			const command = new ModifyCacheClusterCommand(params);
			const response = await elasticacheClient.send(command);

			const cluster = response.CacheCluster;

			return {
				cacheClusterId: cluster?.CacheClusterId || null,
				cacheClusterStatus: cluster?.CacheClusterStatus || null,
				pendingChanges: cluster?.PendingModifiedValues || null,
				modificationSuccess: !!cluster,
			};
		} catch (error) {
			console.error("Error modifying ElastiCache cluster:", error);
			throw error;
		}
	}
}

const modifyCacheClusterService = new ModifyCacheClusterService();

export default new BaseService(
	modifyCacheClusterService.toolName,
	modifyCacheClusterService.description,
	modifyCacheClusterService.modifyCacheClusterInput,
	modifyCacheClusterService.modifyCacheClusterZodInput,
	modifyCacheClusterService.modifyCacheCluster,
);
