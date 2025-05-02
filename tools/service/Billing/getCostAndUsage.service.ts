import {
	CostExplorerClient,
	GetCostAndUsageCommand,
	GroupDefinition,
} from "@aws-sdk/client-cost-explorer";
import { z } from "zod";

class GetCostAndUsageService {
	/**
	 * Retrieves detailed cost and usage data using AWS Cost Explorer
	 * @param region Specifies the AWS region for Cost Explorer
	 * @param timePeriod The start and end date for retrieving data
	 * @param granularity The time granularity for the data
	 * @param groupBy A list of dimensions to group the results by
	 * @param filter JSON string specifying filters to apply
	 * @param metrics A list of metrics to retrieve
	 * @returns Promise containing cost and usage data
	 */

	toolName = "get-cost-and-usage";
	description =
		"Retrieves detailed cost and usage data using AWS Cost Explorer";
	getCostAndUsageInput = {
		region: z
			.string()
			.default("us-east-1")
			.describe(
				"Specifies the AWS region for Cost Explorer (typically us-east-1)",
			),
		timePeriod: z
			.string()
			.describe(
				"The start and end date for retrieving data, in YYYY-MM-DD format (e.g., 2024-01-01,2024-01-31)",
			),
		granularity: z
			.enum(["DAILY", "MONTHLY"])
			.default("MONTHLY")
			.describe(
				"The time granularity for the data. Allowed values: DAILY, MONTHLY",
			),
		groupBy: z
			.string()
			.optional()
			.describe(
				"A comma-separated list of dimensions to group the results by (e.g., SERVICE, REGION, USAGE_TYPE)",
			),
		filter: z
			.string()
			.optional()
			.describe(
				'A JSON string specifying filters to apply (e.g., {"Dimensions": {"Key": "SERVICE", "Values": ["Amazon EC2"]}})',
			),
		metrics: z
			.string()
			.default("UnblendedCost")
			.describe(
				"A comma-separated list of metrics to retrieve (e.g., UnblendedCost, UsageQuantity)",
			),
	};

	getCostAndUsageZodInput = z.object(this.getCostAndUsageInput);

	async getCostAndUsage({
		region = "us-east-1",
		timePeriod,
		granularity = "MONTHLY",
		groupBy,
		filter,
		metrics = "UnblendedCost",
	}: {
		region?: string;
		timePeriod: string;
		granularity?: "DAILY" | "MONTHLY";
		groupBy?: string;
		filter?: string;
		metrics?: string;
	}) {
		try {
			// Create a new CostExplorerClient with the provided region
			const costExplorerClient = new CostExplorerClient({ region });

			// Parse the time period (start and end dates)
			const [start, end] = timePeriod.split(",").map((date) => date.trim());
			if (!start || !end) {
				throw new Error("Time period must be in format: YYYY-MM-DD,YYYY-MM-DD");
			}

			// Parse group by dimensions, if provided
			const groupDefinitions: GroupDefinition[] = [];
			if (groupBy) {
				const groupByDimensions = groupBy
					.split(",")
					.map((dimension) => dimension.trim());
				for (const dimension of groupByDimensions) {
					groupDefinitions.push({
						Type: "DIMENSION",
						Key: dimension,
					});
				}
			}

			// Parse metrics
			const metricsList = metrics.split(",").map((metric) => metric.trim());

			// Parse filter, if provided
			let filterObj = undefined;
			if (filter) {
				try {
					filterObj = JSON.parse(filter);
				} catch (error) {
					throw new Error("Invalid filter JSON format");
				}
			}

			const command = new GetCostAndUsageCommand({
				TimePeriod: {
					Start: start,
					End: end,
				},
				Granularity: granularity,
				GroupBy: groupDefinitions.length > 0 ? groupDefinitions : undefined,
				Filter: filterObj,
				Metrics: metricsList,
			});

			const response = await costExplorerClient.send(command);
			return response;
		} catch (error) {
			console.error("Error getting cost and usage data:", error);
			throw error;
		}
	}
}

export default new GetCostAndUsageService();
