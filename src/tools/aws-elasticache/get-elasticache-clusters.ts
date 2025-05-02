import { z } from "zod";
import { ToolDefinition } from "../../types/tool";

export const getElastiCacheClustersSchema = z.object({
	region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
	filters: z
		.array(
			z.object({
				Name: z
					.string()
					.describe('Filter name (e.g., "engine", "cache-cluster-id")'),
				Values: z.array(z.string()).describe("Array of filter values"),
			}),
		)
		.optional()
		.describe("Array of AWS ElastiCache filters to apply"),
	maxResults: z
		.number()
		.optional()
		.describe("Maximum number of results to return"),
	showNodeInfo: z
		.boolean()
		.optional()
		.default(false)
		.describe("Whether to include detailed node information"),
});

export type GetElastiCacheClustersParams = z.infer<
	typeof getElastiCacheClustersSchema
>;

const getElastiCacheClusters: ToolDefinition<GetElastiCacheClustersParams> = {
	schema: getElastiCacheClustersSchema,
	name: "aws-elasticache_get-elasticache-clusters",
	description:
		"Get ElastiCache clusters from a specific AWS region with flexible filtering options",
};

export default getElastiCacheClusters;
