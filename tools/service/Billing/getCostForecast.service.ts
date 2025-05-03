import {
	CostExplorerClient,
	GetCostForecastCommand,
	type MetricValue,
} from "@aws-sdk/client-cost-explorer";
import { z } from "zod";
import BaseService from "../base.service";
class GetCostForecastService {
	/**
	 * Retrieves a cost forecast using AWS Cost Explorer
	 * @param region Specifies the AWS region for Cost Explorer
	 * @param timePeriod The start and end date for the forecast period
	 * @param granularity The time granularity for the forecast
	 * @param filter JSON string specifying filters to apply
	 * @param metric The metric to forecast
	 * @param predictionIntervalLevel The confidence interval for the forecast
	 * @returns Promise containing forecast data
	 */

	toolName = "get-cost-forecast";
	description = "Retrieves a cost forecast using AWS Cost Explorer";
	getCostForecastInput = {
		region: z
			.string()
			.default("us-east-1")
			.describe(
				"Specifies the AWS region for Cost Explorer (typically us-east-1)",
			),
		timePeriod: z
			.string()
			.describe(
				"The start and end date for the forecast period, in YYYY-MM-DD format (e.g., 2024-06-01,2024-06-30)",
			),
		granularity: z
			.enum(["DAILY", "MONTHLY"])
			.default("MONTHLY")
			.describe("The time granularity for the forecast (DAILY or MONTHLY)"),
		filter: z
			.string()
			.optional()
			.describe(
				'A JSON string specifying filters to apply (e.g., {"Dimensions": {"Key": "SERVICE", "Values": ["Amazon EC2"]}})',
			),
		metric: z
			.enum([
				"AMORTIZED_COST",
				"BLENDED_COST",
				"NET_AMORTIZED_COST",
				"NET_UNBLENDED_COST",
				"UNBLENDED_COST",
				"USAGE_QUANTITY",
			])
			.default("UNBLENDED_COST")
			.describe("The metric to forecast"),
		predictionIntervalLevel: z
			.number()
			.optional()
			.describe("The confidence interval for the forecast (e.g., 85, 95)"),
	};

	getCostForecastZodInput = z.object(this.getCostForecastInput);

	async getCostForecast({
		region = "us-east-1",
		timePeriod,
		granularity = "MONTHLY",
		filter,
		metric = "UNBLENDED_COST",
		predictionIntervalLevel,
	}: {
		region?: string;
		timePeriod: string;
		granularity?: "DAILY" | "MONTHLY";
		filter?: string;
		metric?:
			| "AMORTIZED_COST"
			| "BLENDED_COST"
			| "NET_AMORTIZED_COST"
			| "NET_UNBLENDED_COST"
			| "UNBLENDED_COST"
			| "USAGE_QUANTITY";
		predictionIntervalLevel?: number;
	}) {
		try {
			// Create a new CostExplorerClient with the provided region
			const costExplorerClient = new CostExplorerClient({ region });

			// Parse the time period (start and end dates)
			const [start, end] = timePeriod.split(",").map((date) => date.trim());
			if (!start || !end) {
				throw new Error("Time period must be in format: YYYY-MM-DD,YYYY-MM-DD");
			}

			// Parse filter, if provided
			let filterObj = undefined;
			if (filter) {
				try {
					filterObj = JSON.parse(filter);
				} catch (error) {
					throw new Error("Invalid filter JSON format");
				}
			}

			const command = new GetCostForecastCommand({
				TimePeriod: {
					Start: start,
					End: end,
				},
				Granularity: granularity,
				Filter: filterObj,
				Metric: metric,
				PredictionIntervalLevel: predictionIntervalLevel,
			});

			const response = await costExplorerClient.send(command);
			return response;
		} catch (error) {
			console.error("Error getting cost forecast:", error);
			throw error;
		}
	}
}

const getCostForecastService = new GetCostForecastService();

export default new BaseService(
	getCostForecastService.toolName,
	getCostForecastService.description,
	getCostForecastService.getCostForecastInput,
	getCostForecastService.getCostForecastZodInput,
	getCostForecastService.getCostForecast,
);
