import { z } from "zod";
import { ToolDefinition } from "../../types/tool";

export const modifyElastiCacheClusterSchema = z.object({
	region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
	clusterId: z.string().describe("The ID of the ElastiCache cluster to modify"),
	applyImmediately: z
		.boolean()
		.optional()
		.default(false)
		.describe(
			"Whether to apply the changes immediately or during the next maintenance window",
		),
	numNodes: z
		.number()
		.optional()
		.describe("The new number of cache nodes for the cluster"),
	nodeType: z
		.string()
		.optional()
		.describe("The new compute and memory capacity of the nodes"),
	engineVersion: z
		.string()
		.optional()
		.describe("The upgraded version of the cache engine to be used"),
	securityGroupIds: z
		.array(z.string())
		.optional()
		.describe("The list of security group IDs to be applied to the cluster"),
	parameterGroupName: z
		.string()
		.optional()
		.describe("The name of the parameter group to apply to this cluster"),
	preferredMaintenanceWindow: z
		.string()
		.optional()
		.describe(
			"Specifies the weekly time range during which maintenance can occur (e.g., sun:05:00-sun:09:00)",
		),
	notificationTopicArn: z
		.string()
		.optional()
		.describe("The Amazon SNS topic ARN to which notifications will be sent"),
	autoMinorVersionUpgrade: z
		.boolean()
		.optional()
		.describe("Enable/disable automatic minor version upgrades"),
});

export type ModifyElastiCacheClusterParams = z.infer<
	typeof modifyElastiCacheClusterSchema
>;

const modifyElastiCacheCluster: ToolDefinition<ModifyElastiCacheClusterParams> =
	{
		schema: modifyElastiCacheClusterSchema,
		name: "aws-elasticache_modify-elasticache-cluster",
		description:
			"Modify configuration settings for an existing ElastiCache cluster",
	};

export default modifyElastiCacheCluster;
