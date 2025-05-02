import {
	CloudWatchClient,
	ListMetricsCommand,
	type Dimension,
} from "@aws-sdk/client-cloudwatch";
import { z } from "zod";

class ListMetricsService {
	/**
	 * Lists available CloudWatch metrics with optional filtering
	 * @param region The AWS region to use
	 * @param namespace Optional metric namespace to filter by
	 * @param metricName Optional metric name to filter by
	 * @param dimensions Optional dimensions to filter by
	 * @returns Promise containing array of available metrics
	 */

	toolName = "list-cloudwatch-metrics";
	description = "Retrieves a detailed list of available CloudWatch metrics";
	listMetricsInput = {
		region: z
			.string()
			.describe(
				"Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`)",
			),
		namespace: z
			.string()
			.optional()
			.describe(
				"Filters the results to include only metrics from the specified namespace (e.g., `AWS/EC2`, `AWS/RDS`)",
			),
		metricName: z
			.string()
			.optional()
			.describe(
				"Filters the results to include only metrics with the specified name (e.g., `CPUUtilization`, `DatabaseConnections`)",
			),
		dimensions: z
			.array(
				z.object({
					Name: z.string().describe("Dimension name"),
					Value: z.string().describe("Dimension value"),
				}),
			)
			.optional()
			.describe("Dimensions to filter the metrics by"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("json")
			.describe("Specifies the desired output format"),
	};

	listMetricsZodInput = z.object(this.listMetricsInput);

	async listMetrics({
		region,
		namespace,
		metricName,
		dimensions,
		outputFormat = "json",
	}: {
		region: string;
		namespace?: string;
		metricName?: string;
		dimensions?: Dimension[];
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create CloudWatch client for the specified region
			const cloudwatchClient = new CloudWatchClient({ region });

			// Prepare command parameters
			const params: any = {};

			if (namespace) {
				params.Namespace = namespace;
			}

			if (metricName) {
				params.MetricName = metricName;
			}

			if (dimensions && dimensions.length > 0) {
				params.Dimensions = dimensions;
			}

			const command = new ListMetricsCommand(params);
			const response = await cloudwatchClient.send(command);

			// Process and format the response based on outputFormat
			const metrics = response.Metrics || [];

			if (outputFormat === "json") {
				return metrics;
			} else if (outputFormat === "table") {
				// Return a structure suitable for table display
				return metrics.map((metric) => ({
					Namespace: metric.Namespace || "",
					MetricName: metric.MetricName || "",
					Dimensions: (metric.Dimensions || [])
						.map((d) => `${d.Name}=${d.Value}`)
						.join(", "),
				}));
			} else {
				// Simple text format
				return metrics
					.map((metric) => {
						const dimensionsText = (metric.Dimensions || [])
							.map((d) => `${d.Name}=${d.Value}`)
							.join(", ");

						return `${metric.Namespace || ""}:${metric.MetricName || ""}${dimensionsText ? ` [${dimensionsText}]` : ""}`;
					})
					.join("\n");
			}
		} catch (error) {
			console.error("Error listing CloudWatch metrics:", error);
			throw error;
		}
	}
}

export default new ListMetricsService();
