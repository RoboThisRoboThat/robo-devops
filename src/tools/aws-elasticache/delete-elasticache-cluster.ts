import { z } from "zod";
import { ToolDefinition } from "../../types/tool";

export const deleteElastiCacheClusterSchema = z.object({
	region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
	clusterId: z.string().describe("The ID of the ElastiCache cluster to delete"),
	finalSnapshotId: z
		.string()
		.optional()
		.describe("The user-provided name of a final cluster snapshot"),
});

export type DeleteElastiCacheClusterParams = z.infer<
	typeof deleteElastiCacheClusterSchema
>;

const deleteElastiCacheCluster: ToolDefinition<DeleteElastiCacheClusterParams> =
	{
		schema: deleteElastiCacheClusterSchema,
		name: "aws-elasticache_delete-elasticache-cluster",
		description:
			"Delete an existing ElastiCache cluster from a specific AWS region",
	};

export default deleteElastiCacheCluster;
