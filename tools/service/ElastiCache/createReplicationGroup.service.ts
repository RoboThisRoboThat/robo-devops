import {
	ElastiCacheClient,
	CreateReplicationGroupCommand,
	type Tag,
} from "@aws-sdk/client-elasticache";
import { z } from "zod";
import BaseService from "../base.service";

class CreateReplicationGroupService {
	/**
	 * Creates a new ElastiCache replication group (for Redis)
	 * @param region Specifies the AWS region in which to create the replication group
	 * @param replicationGroupId The unique identifier for the new replication group
	 * @param replicationGroupDescription A description for the replication group
	 * @param primaryClusterId Optional existing cluster ID to use as primary
	 * @param numNodeGroups Optional number of node groups (shards) for cluster mode
	 * @param nodesPerNodeGroup Optional number of nodes per node group
	 * @param cacheNodeType The compute and memory capacity of the cache nodes
	 * @param engine Must be 'redis' for replication groups
	 * @param engineVersion Optional Redis engine version
	 * @param preferredCacheClusterAZs Optional list of AZs for cache nodes
	 * @param cacheSubnetGroupName Optional cache subnet group name
	 * @param vpcSecurityGroupIds Optional VPC security group IDs
	 * @param preferredMaintenanceWindow Optional weekly maintenance window
	 * @param port Optional port for connections (default 6379)
	 * @param automaticFailoverEnabled Optional automatic failover setting
	 * @param multiAZ Optional multi-AZ deployment setting
	 * @param snapshotArns Optional list of snapshot ARNs to restore from
	 * @param snapshotName Optional snapshot name to restore from
	 * @param tags Optional tags to assign
	 * @returns Promise containing details of the created replication group
	 */

	toolName = "create-replication-group";
	description =
		"Creates a new ElastiCache replication group (for Redis) in the specified AWS region";

	createReplicationGroupInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region in which to create the replication group (e.g., us-east-1)",
			),
		replicationGroupId: z
			.string()
			.describe(
				"The unique identifier for the new replication group (e.g., my-redis-ha)",
			),
		replicationGroupDescription: z
			.string()
			.describe("A description for the replication group"),
		primaryClusterId: z
			.string()
			.optional()
			.describe(
				"The cluster ID of the primary node in the replication group. Required if creating from an existing cluster",
			),
		numNodeGroups: z
			.number()
			.int()
			.min(1)
			.optional()
			.default(1)
			.describe(
				"The number of node groups (shards) for Redis clusters in cluster mode",
			),
		nodesPerNodeGroup: z
			.number()
			.int()
			.min(1)
			.optional()
			.default(1)
			.describe(
				"The number of nodes per node group (including the primary and replicas)",
			),
		cacheNodeType: z
			.string()
			.describe(
				"The compute and memory capacity of the cache nodes (e.g., cache.t2.micro, cache.m5.large)",
			),
		engine: z
			.literal("redis")
			.describe("The name of the cache engine (must be redis)"),
		engineVersion: z
			.string()
			.optional()
			.describe("The version number of the Redis engine to use"),
		preferredCacheClusterAZs: z
			.array(z.string())
			.optional()
			.describe("A list of AZs in which the cache nodes will be created"),
		cacheSubnetGroupName: z
			.string()
			.optional()
			.describe("The name of the cache subnet group to use"),
		vpcSecurityGroupIds: z
			.array(z.string())
			.optional()
			.describe(
				"A list of VPC security group IDs to associate with the replication group",
			),
		preferredMaintenanceWindow: z
			.string()
			.optional()
			.describe("The weekly maintenance window"),
		port: z
			.number()
			.int()
			.positive()
			.optional()
			.default(6379)
			.describe(
				"The port number on which each of the cache nodes will accept connections",
			),
		automaticFailoverEnabled: z
			.boolean()
			.optional()
			.default(true)
			.describe("Specifies whether automatic failover is enabled"),
		multiAZ: z
			.boolean()
			.optional()
			.describe(
				"Specifies whether to create the replication group with nodes in multiple AZs",
			),
		snapshotArns: z
			.array(z.string())
			.optional()
			.describe(
				"A list of snapshot ARNs from which to create the replication group",
			),
		snapshotName: z
			.string()
			.optional()
			.describe(
				"The name of a snapshot from which to create the replication group",
			),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe("A list of key-value pairs to assign as tags"),
	};

	createReplicationGroupZodInput = z.object(this.createReplicationGroupInput);

	async createReplicationGroup({
		region,
		replicationGroupId,
		replicationGroupDescription,
		primaryClusterId,
		numNodeGroups = 1,
		nodesPerNodeGroup = 1,
		cacheNodeType,
		engine,
		engineVersion,
		preferredCacheClusterAZs,
		cacheSubnetGroupName,
		vpcSecurityGroupIds,
		preferredMaintenanceWindow,
		port = 6379,
		automaticFailoverEnabled = true,
		multiAZ,
		snapshotArns,
		snapshotName,
		tags,
	}: {
		region: string;
		replicationGroupId: string;
		replicationGroupDescription: string;
		primaryClusterId?: string;
		numNodeGroups?: number;
		nodesPerNodeGroup?: number;
		cacheNodeType: string;
		engine: "redis";
		engineVersion?: string;
		preferredCacheClusterAZs?: string[];
		cacheSubnetGroupName?: string;
		vpcSecurityGroupIds?: string[];
		preferredMaintenanceWindow?: string;
		port?: number;
		automaticFailoverEnabled?: boolean;
		multiAZ?: boolean;
		snapshotArns?: string[];
		snapshotName?: string;
		tags?: { Key: string; Value: string }[];
	}): Promise<{
		replicationGroupId: string | null;
		description: string | null;
		status: string | null;
		pendingModifiedValues: Record<string, unknown> | null;
		memberClusters: string[] | null;
		creationSuccess: boolean;
	}> {
		try {
			// Create a new ElastiCacheClient for the specified region
			const elasticacheClient = new ElastiCacheClient({ region });

			// Set up command parameters
			const params: Record<string, unknown> = {
				ReplicationGroupId: replicationGroupId,
				ReplicationGroupDescription: replicationGroupDescription,
				CacheNodeType: cacheNodeType,
				Engine: engine,
				Port: port,
				AutomaticFailoverEnabled: automaticFailoverEnabled,
			};

			// Add conditional parameters based on creation type
			if (primaryClusterId) {
				// Creating from an existing cluster
				params.PrimaryClusterId = primaryClusterId;
			} else {
				// Creating a new cluster
				params.NumNodeGroups = numNodeGroups;
				params.ReplicasPerNodeGroup = nodesPerNodeGroup - 1; // Subtract 1 to account for primary
			}

			// Add other optional parameters if provided
			if (engineVersion) params.EngineVersion = engineVersion;
			if (preferredCacheClusterAZs && preferredCacheClusterAZs.length > 0)
				params.PreferredCacheClusterAZs = preferredCacheClusterAZs;
			if (cacheSubnetGroupName)
				params.CacheSubnetGroupName = cacheSubnetGroupName;
			if (vpcSecurityGroupIds && vpcSecurityGroupIds.length > 0)
				params.SecurityGroupIds = vpcSecurityGroupIds;
			if (preferredMaintenanceWindow)
				params.PreferredMaintenanceWindow = preferredMaintenanceWindow;
			if (multiAZ !== undefined) params.MultiAZEnabled = multiAZ;
			if (snapshotArns && snapshotArns.length > 0)
				params.SnapshotArns = snapshotArns;
			if (snapshotName) params.SnapshotName = snapshotName;
			if (tags && tags.length > 0) params.Tags = tags;

			const command = new CreateReplicationGroupCommand(params);
			const response = await elasticacheClient.send(command);

			const group = response.ReplicationGroup;
			if (!group) {
				throw new Error(
					"Failed to create replication group, no group details returned",
				);
			}

			return {
				replicationGroupId: group.ReplicationGroupId || null,
				description: group.Description || null,
				status: group.Status || null,
				pendingModifiedValues: group.PendingModifiedValues || null,
				memberClusters: group.MemberClusters || null,
				creationSuccess: true,
			};
		} catch (error) {
			console.error("Error creating ElastiCache replication group:", error);
			throw error;
		}
	}
}

const createReplicationGroupService = new CreateReplicationGroupService();

export default new BaseService(
	createReplicationGroupService.toolName,
	createReplicationGroupService.description,
	createReplicationGroupService.createReplicationGroupInput,
	createReplicationGroupService.createReplicationGroupZodInput,
	createReplicationGroupService.createReplicationGroup,
);
