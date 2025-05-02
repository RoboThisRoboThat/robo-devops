import { ElastiCache } from "aws-sdk";
import { DescribeElastiCacheParameterGroupsParams } from "./describe-elasticache-parameter-groups";

export class DescribeElastiCacheParameterGroupsService {
	async execute(
		params: DescribeElastiCacheParameterGroupsParams,
	): Promise<any> {
		const { region, parameterGroupName, maxResults, filterByEngine } = params;

		// Initialize the ElastiCache client with the specified region
		const elastiCache = new ElastiCache({ region });

		// Build the request parameters
		const requestParams: ElastiCache.DescribeCacheParameterGroupsMessage = {
			MaxRecords: maxResults,
		};

		// Add parameter group name if provided
		if (parameterGroupName) {
			requestParams.CacheParameterGroupName = parameterGroupName;
		}

		try {
			// Call the AWS SDK to describe the ElastiCache parameter groups
			const response = await elastiCache
				.describeCacheParameterGroups(requestParams)
				.promise();

			// Filter by engine if specified
			let parameterGroups = response.CacheParameterGroups || [];
			if (filterByEngine && parameterGroups.length > 0) {
				parameterGroups = parameterGroups.filter((group) =>
					group.CacheParameterGroupFamily?.includes(filterByEngine),
				);
			}

			// Return the parameter groups information
			return {
				parameterGroups: parameterGroups.map((group) => ({
					name: group.CacheParameterGroupName,
					family: group.CacheParameterGroupFamily,
					description: group.Description,
					arn: group.ARN,
				})),
				region,
			};
		} catch (error) {
			console.error("Error describing ElastiCache parameter groups:", error);
			throw error;
		}
	}
}
