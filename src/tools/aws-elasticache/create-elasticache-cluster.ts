import { z } from "zod";
import { ToolDefinition } from "../../types/tool";

export const createElastiCacheClusterSchema = z.object({
	region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
	clusterId: z.string().describe("Unique identifier for the cache cluster"),
	nodeType: z
		.string()
		.describe(
			"The compute and memory capacity of the nodes (e.g., cache.t3.micro)",
		),
	engine: z
		.string()
		.describe("The name of the cache engine to be used (redis or memcached)"),
	numNodes: z
		.number()
		.optional()
		.default(1)
		.describe("The number of cache nodes in the cluster"),
	engineVersion: z
		.string()
		.optional()
		.describe("The version of the cache engine to be used"),
	port: z
		.number()
		.optional()
		.describe(
			"The port number on which each of the cache nodes will accept connections",
		),
	parameterGroupName: z
		.string()
		.optional()
		.describe(
			"The name of the parameter group to associate with this cache cluster",
		),
	subnetGroupName: z
		.string()
		.optional()
		.describe("The name of the subnet group to be used for the cache cluster"),
	securityGroupIds: z
		.array(z.string())
		.optional()
		.describe(
			"List of security group IDs to associate with this cache cluster",
		),
	tags: z
		.array(
			z.object({
				Key: z.string().describe("Tag key"),
				Value: z.string().describe("Tag value"),
			}),
		)
		.optional()
		.describe("A list of tags to associate with the cluster"),
});

export type CreateElastiCacheClusterParams = z.infer<
	typeof createElastiCacheClusterSchema
>;

const createElastiCacheCluster: ToolDefinition<CreateElastiCacheClusterParams> =
	{
		schema: createElastiCacheClusterSchema,
		name: "aws-elasticache_create-elasticache-cluster",
		description:
			"Create a new ElastiCache cluster in a specific AWS region with specified configuration",
	};

export default createElastiCacheCluster;
