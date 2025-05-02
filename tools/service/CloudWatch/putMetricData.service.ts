import {
	CloudWatchClient,
	PutMetricDataCommand,
	type MetricDatum,
} from "@aws-sdk/client-cloudwatch";
import { z } from "zod";

class PutMetricDataService {
	/**
	 * Publishes metric data points to CloudWatch
	 * @param region The AWS region to use
	 * @param namespace The namespace for the metric data
	 * @param metricData The metric data points to publish
	 * @returns Promise containing the result of the metric data publication
	 */

	toolName = "put-cloudwatch-metric-data";
	description = "Publishes metric data points to CloudWatch";
	putMetricDataInput = {
		region: z.string().describe("Specifies the AWS region to publish to"),
		namespace: z
			.string()
			.describe("The namespace for the custom metric (e.g., `MyApp/Backend`)"),
		metricData: z
			.array(
				z.object({
					MetricName: z.string().describe("The name of the metric"),
					Timestamp: z
						.string()
						.optional()
						.describe(
							"The timestamp of the metric data point, in ISO 8601 format",
						),
					Value: z.number().describe("The value for the metric"),
					Unit: z.string().optional().describe("The unit of the metric"),
					Dimensions: z
						.array(
							z.object({
								Name: z.string().describe("Dimension name"),
								Value: z.string().describe("Dimension value"),
							}),
						)
						.optional()
						.describe("Dimensions for the metric data point"),
				}),
			)
			.describe(
				"A JSON string or a path to a JSON file defining the metric data points to publish",
			),
	};

	putMetricDataZodInput = z.object(this.putMetricDataInput);

	async putMetricData({
		region,
		namespace,
		metricData,
	}: {
		region: string;
		namespace: string;
		metricData: MetricDatum[];
	}) {
		try {
			// Create CloudWatch client for the specified region
			const cloudwatchClient = new CloudWatchClient({ region });

			// Process the timestamp strings into Date objects
			const processedMetricData = metricData.map((datum) => {
				const processed = { ...datum };

				// Convert timestamp string to Date object if it exists
				if (typeof processed.Timestamp === "string") {
					processed.Timestamp = new Date(processed.Timestamp);
				}

				return processed;
			});

			const command = new PutMetricDataCommand({
				Namespace: namespace,
				MetricData: processedMetricData,
			});

			await cloudwatchClient.send(command);

			// Successfully published the metric data
			return {
				success: true,
				namespace,
				metricCount: metricData.length,
				message: `Published ${metricData.length} metric data point(s) to CloudWatch namespace '${namespace}' successfully.`,
			};
		} catch (error) {
			console.error(
				`Error publishing metric data to CloudWatch namespace '${namespace}':`,
				error,
			);
			throw error;
		}
	}
}

export default new PutMetricDataService();
