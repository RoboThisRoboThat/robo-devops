import {
	ElastiCacheClient,
	CreateCacheClusterCommand,
	type Tag,
} from "@aws-sdk/client-elasticache";
import { z } from "zod";
import BaseService from "../base.service";

class CreateCacheClusterService {
	/**
	 * Creates a new ElastiCache cluster
	 * @param region Specifies the AWS region in which to create the cluster
	 * @param cacheClusterId The unique identifier for the new cache cluster
	 * @param cacheNodeType The compute and memory capacity of the cache nodes
	 * @param engine The name of the cache engine to be used (memcached or redis)
	 * @param engineVersion Optional version number of the cache engine to use
	 * @param numCacheNodes The initial number of cache nodes for the cluster
	 * @param preferredAvailabilityZone Optional EC2 Availability Zone for the cluster
	 * @param cacheSubnetGroupName Optional cache subnet group name (required for VPC)
	 * @param vpcSecurityGroupIds Optional VPC security group IDs
	 * @param preferredMaintenanceWindow Optional weekly maintenance window
	 * @param port Optional port number for connections
	 * @param notificationTopicArn Optional SNS topic ARN for notifications
	 * @param securityGroupNames Optional EC2 security group names (for non-VPC)
	 * @param azMode Optional AZ mode (single-az or multi-az) for Memcached
	 * @param tags Optional tags to assign to the cluster
	 * @returns Promise containing details of the created cache cluster
	 */

	toolName = "create-cache-cluster";
	description = "Creates a new ElastiCache cluster in the specified AWS region";

	createCacheClusterInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region in which to create the cluster (e.g., us-east-1)",
			),
		cacheClusterId: z
			.string()
			.describe(
				"The unique identifier for the new cache cluster (e.g., my-new-cache)",
			),
		cacheNodeType: z
			.string()
			.describe(
				"The compute and memory capacity of the cache nodes (e.g., cache.t2.micro, cache.m5.large)",
			),
		engine: z
			.enum(["memcached", "redis"])
			.describe(
				"The name of the cache engine to be used for this cache cluster",
			),
		engineVersion: z
			.string()
			.optional()
			.describe("The version number of the cache engine to use"),
		numCacheNodes: z
			.number()
			.int()
			.min(1)
			.describe(
				"The initial number of cache nodes that the cache cluster will have",
			),
		preferredAvailabilityZone: z
			.string()
			.optional()
			.describe(
				"The EC2 Availability Zone in which the cache cluster will be created",
			),
		cacheSubnetGroupName: z
			.string()
			.optional()
			.describe(
				"The name of the cache subnet group to use for the cache cluster. Required if the cluster will be in a VPC",
			),
		vpcSecurityGroupIds: z
			.array(z.string())
			.optional()
			.describe(
				"A list of VPC security group IDs to associate with the cache cluster",
			),
		preferredMaintenanceWindow: z
			.string()
			.optional()
			.describe(
				"The weekly time range during which system maintenance can occur",
			),
		port: z
			.number()
			.int()
			.positive()
			.optional()
			.describe(
				"The port number on which each of the cache nodes will accept connections",
			),
		notificationTopicArn: z
			.string()
			.optional()
			.describe(
				"The ARN of the Amazon SNS topic to which notifications will be sent",
			),
		securityGroupNames: z
			.array(z.string())
			.optional()
			.describe(
				"A list of EC2 security group names to associate with this cache cluster (for non-VPC environments)",
			),
		azMode: z
			.enum(["single-az", "multi-az"])
			.optional()
			.describe(
				"Specifies whether the nodes in this Memcached cluster are created in a single Availability Zone or across multiple AZs",
			),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe(
				"A list of key-value pairs to assign as tags to the new cache cluster",
			),
	};

	createCacheClusterZodInput = z.object(this.createCacheClusterInput);

	async createCacheCluster({
		region,
		cacheClusterId,
		cacheNodeType,
		engine,
		engineVersion,
		numCacheNodes,
		preferredAvailabilityZone,
		cacheSubnetGroupName,
		vpcSecurityGroupIds,
		preferredMaintenanceWindow,
		port,
		notificationTopicArn,
		securityGroupNames,
		azMode,
		tags,
	}: {
		region: string;
		cacheClusterId: string;
		cacheNodeType: string;
		engine: "memcached" | "redis";
		engineVersion?: string;
		numCacheNodes: number;
		preferredAvailabilityZone?: string;
		cacheSubnetGroupName?: string;
		vpcSecurityGroupIds?: string[];
		preferredMaintenanceWindow?: string;
		port?: number;
		notificationTopicArn?: string;
		securityGroupNames?: string[];
		azMode?: "single-az" | "multi-az";
		tags?: { Key: string; Value: string }[];
	}): Promise<{
		cacheClusterId: string | null;
		cacheClusterStatus: string | null;
		engine: string | null;
		engineVersion: string | null;
		cacheNodeType: string | null;
		numCacheNodes: number | null;
	}> {
		try {
			// Create a new ElastiCacheClient for the specified region
			const elasticacheClient = new ElastiCacheClient({ region });

			// Set up command parameters
			const params: Record<string, any> = {
				CacheClusterId: cacheClusterId,
				CacheNodeType: cacheNodeType,
				Engine: engine,
				NumCacheNodes: numCacheNodes,
			};

			// Add optional parameters if provided
			if (engineVersion) params.EngineVersion = engineVersion;
			if (preferredAvailabilityZone)
				params.PreferredAvailabilityZone = preferredAvailabilityZone;
			if (cacheSubnetGroupName)
				params.CacheSubnetGroupName = cacheSubnetGroupName;
			if (vpcSecurityGroupIds && vpcSecurityGroupIds.length > 0)
				params.SecurityGroupIds = vpcSecurityGroupIds;
			if (preferredMaintenanceWindow)
				params.PreferredMaintenanceWindow = preferredMaintenanceWindow;
			if (port) params.Port = port;
			if (notificationTopicArn)
				params.NotificationTopicArn = notificationTopicArn;
			if (securityGroupNames && securityGroupNames.length > 0)
				params.CacheSecurityGroupNames = securityGroupNames;
			if (azMode) params.AZMode = azMode.toUpperCase();
			if (tags && tags.length > 0) params.Tags = tags;

			const command = new CreateCacheClusterCommand(params);
			const response = await elasticacheClient.send(command);

			const cluster = response.CacheCluster;
			if (!cluster) {
				throw new Error(
					"Failed to create cache cluster, no cluster details returned",
				);
			}

			return {
				cacheClusterId: cluster.CacheClusterId || null,
				cacheClusterStatus: cluster.CacheClusterStatus || null,
				engine: cluster.Engine || null,
				engineVersion: cluster.EngineVersion || null,
				cacheNodeType: cluster.CacheNodeType || null,
				numCacheNodes: cluster.NumCacheNodes || null,
			};
		} catch (error) {
			console.error("Error creating ElastiCache cluster:", error);
			throw error;
		}
	}
}

const createCacheClusterService = new CreateCacheClusterService();

export default new BaseService(
	createCacheClusterService.toolName,
	createCacheClusterService.description,
	createCacheClusterService.createCacheClusterInput,
	createCacheClusterService.createCacheClusterZodInput,
	createCacheClusterService.createCacheCluster,
);
