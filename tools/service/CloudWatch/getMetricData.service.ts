import {
	CloudWatchClient,
	GetMetricDataCommand,
	type MetricDataQuery,
} from "@aws-sdk/client-cloudwatch";
import { z } from "zod";

class GetMetricDataService {
	/**
	 * Retrieves time series data for CloudWatch metrics
	 * @param region The AWS region to use
	 * @param metricDataQueries The metric data queries
	 * @param startTime The start time for the query
	 * @param endTime The end time for the query
	 * @returns Promise containing the metric data time series
	 */

	toolName = "get-cloudwatch-metric-data";
	description = "Retrieves time series data for one or more CloudWatch metrics";
	getMetricDataInput = {
		region: z.string().describe("Specifies the AWS region to query"),
		metricDataQueries: z
			.array(
				z.object({
					Id: z.string().describe("A unique identifier for this query"),
					MetricStat: z
						.object({
							Metric: z
								.object({
									Namespace: z.string().describe("The metric namespace"),
									MetricName: z.string().describe("The metric name"),
									Dimensions: z
										.array(
											z.object({
												Name: z.string().describe("Dimension name"),
												Value: z.string().describe("Dimension value"),
											}),
										)
										.optional()
										.describe("The metric dimensions"),
								})
								.describe("The metric to query"),
							Period: z
								.number()
								.describe(
									"The granularity, in seconds, of the returned data points",
								),
							Stat: z
								.string()
								.describe(
									"The statistic to use (Average, Sum, SampleCount, etc.)",
								),
						})
						.optional()
						.describe("The metric to query and how to use its data"),
					Expression: z
						.string()
						.optional()
						.describe(
							"The math expression to be performed on the returned data",
						),
					ReturnData: z
						.boolean()
						.optional()
						.describe("Whether to return this query's data in the response"),
				}),
			)
			.describe(
				"A JSON string or a path to a JSON file defining the metrics to retrieve data for",
			),
		startTime: z
			.string()
			.describe(
				"The start of the time range to retrieve data from, in ISO 8601 format (e.g., `2025-05-01T00:00:00Z`)",
			),
		endTime: z
			.string()
			.describe(
				"The end of the time range to retrieve data to, in ISO 8601 format (e.g., `2025-05-01T17:00:00Z`)",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("json")
			.describe("Specifies the output format"),
	};

	getMetricDataZodInput = z.object(this.getMetricDataInput);

	async getMetricData({
		region,
		metricDataQueries,
		startTime,
		endTime,
		outputFormat = "json",
	}: {
		region: string;
		metricDataQueries: MetricDataQuery[];
		startTime: string;
		endTime: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create CloudWatch client for the specified region
			const cloudwatchClient = new CloudWatchClient({ region });

			// Convert string dates to Date objects
			const startTimeDate = new Date(startTime);
			const endTimeDate = new Date(endTime);

			const command = new GetMetricDataCommand({
				MetricDataQueries: metricDataQueries,
				StartTime: startTimeDate,
				EndTime: endTimeDate,
				ScanBy: "TimestampAscending",
			});

			const response = await cloudwatchClient.send(command);

			// Process and format the response based on outputFormat
			const results = response.MetricDataResults || [];

			if (outputFormat === "json") {
				return {
					results,
					nextToken: response.NextToken,
				};
			} else if (outputFormat === "table") {
				// Return a structure suitable for table display
				const tableResults = results.map((result) => {
					// Format timestamps and values for better readability
					const dataPoints = (result.Timestamps || []).map(
						(timestamp, index) => ({
							Timestamp: timestamp.toISOString(),
							Value: result.Values ? result.Values[index] : null,
						}),
					);

					return {
						Id: result.Id || "",
						Label: result.Label || "",
						StatusCode: result.StatusCode || "",
						DataPoints: dataPoints,
					};
				});

				return {
					results: tableResults,
					nextToken: response.NextToken,
				};
			} else {
				// Simple text format
				const textResults = results
					.map((result) => {
						const label = result.Label || result.Id || "Unknown";
						const dataPoints = (result.Timestamps || [])
							.map((timestamp, index) => {
								const value = result.Values ? result.Values[index] : null;
								return `  ${timestamp.toISOString()}: ${value !== null ? value : "N/A"}`;
							})
							.join("\n");

						return `Metric: ${label}\n${dataPoints}`;
					})
					.join("\n\n");

				return textResults;
			}
		} catch (error) {
			console.error("Error getting CloudWatch metric data:", error);
			throw error;
		}
	}
}

export default new GetMetricDataService();
