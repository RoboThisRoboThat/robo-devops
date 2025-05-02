import { z } from "zod";
import { ToolDefinition } from "../../types/tool";

export const describeElastiCacheParameterGroupsSchema = z.object({
	region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
	parameterGroupName: z
		.string()
		.optional()
		.describe("The name of a specific parameter group to describe"),
	maxResults: z
		.number()
		.optional()
		.describe("The maximum number of records to include in the response"),
	filterByEngine: z
		.string()
		.optional()
		.describe("Filter results by cache engine (redis or memcached)"),
});

export type DescribeElastiCacheParameterGroupsParams = z.infer<
	typeof describeElastiCacheParameterGroupsSchema
>;

const describeElastiCacheParameterGroups: ToolDefinition<DescribeElastiCacheParameterGroupsParams> =
	{
		schema: describeElastiCacheParameterGroupsSchema,
		name: "aws-elasticache_describe-elasticache-parameter-groups",
		description:
			"Retrieve details about ElastiCache parameter groups in a specific AWS region",
	};

export default describeElastiCacheParameterGroups;
