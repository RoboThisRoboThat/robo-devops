import {
	CloudWatchClient,
	DescribeAlarmsCommand,
} from "@aws-sdk/client-cloudwatch";
import { z } from "zod";

class DescribeAlarmService {
	/**
	 * Retrieves detailed information about a specific CloudWatch alarm
	 * @param region The AWS region to use
	 * @param alarmName The name of the CloudWatch alarm to describe
	 * @returns Promise containing the detailed alarm information
	 */

	toolName = "describe-cloudwatch-alarm";
	description =
		"Displays detailed information about a specific CloudWatch alarm";
	describeAlarmInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the alarm resides"),
		alarmName: z
			.string()
			.describe(
				"The name of the CloudWatch alarm to describe (e.g., `HighCPUUtilization`)",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("json")
			.describe("Specifies the output format"),
	};

	describeAlarmZodInput = z.object(this.describeAlarmInput);

	async describeAlarm({
		region,
		alarmName,
		outputFormat = "json",
	}: {
		region: string;
		alarmName: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create CloudWatch client for the specified region
			const cloudwatchClient = new CloudWatchClient({ region });

			const command = new DescribeAlarmsCommand({
				AlarmNames: [alarmName],
			});

			const response = await cloudwatchClient.send(command);

			// Find the requested alarm
			const metricAlarm = response.MetricAlarms?.find(
				(alarm) => alarm.AlarmName === alarmName,
			);
			const compositeAlarm = response.CompositeAlarms?.find(
				(alarm) => alarm.AlarmName === alarmName,
			);

			if (!metricAlarm && !compositeAlarm) {
				throw new Error(`Alarm with name '${alarmName}' not found.`);
			}

			if (outputFormat === "json") {
				return metricAlarm || compositeAlarm;
			} else if (outputFormat === "table") {
				// Return a structure suitable for table display
				if (metricAlarm) {
					return {
						Type: "MetricAlarm",
						AlarmName: metricAlarm.AlarmName || "",
						AlarmArn: metricAlarm.AlarmArn || "",
						StateValue: metricAlarm.StateValue || "",
						StateReason: metricAlarm.StateReason || "",
						StateUpdatedTimestamp:
							metricAlarm.StateUpdatedTimestamp?.toISOString() || "",
						MetricName: metricAlarm.MetricName || "",
						Namespace: metricAlarm.Namespace || "",
						Statistic: metricAlarm.Statistic || "",
						Dimensions: (metricAlarm.Dimensions || [])
							.map((d) => `${d.Name}=${d.Value}`)
							.join(", "),
						Period: metricAlarm.Period || 0,
						EvaluationPeriods: metricAlarm.EvaluationPeriods || 0,
						Threshold: metricAlarm.Threshold || 0,
						ComparisonOperator: metricAlarm.ComparisonOperator || "",
						TreatMissingData: metricAlarm.TreatMissingData || "",
						ActionsEnabled: metricAlarm.ActionsEnabled ? "Yes" : "No",
						AlarmActions: (metricAlarm.AlarmActions || []).join(", "),
						OKActions: (metricAlarm.OKActions || []).join(", "),
						InsufficientDataActions: (
							metricAlarm.InsufficientDataActions || []
						).join(", "),
					};
				} else if (compositeAlarm) {
					return {
						Type: "CompositeAlarm",
						AlarmName: compositeAlarm.AlarmName || "",
						AlarmArn: compositeAlarm.AlarmArn || "",
						StateValue: compositeAlarm.StateValue || "",
						StateReason: compositeAlarm.StateReason || "",
						StateUpdatedTimestamp:
							compositeAlarm.StateUpdatedTimestamp?.toISOString() || "",
						AlarmRule: compositeAlarm.AlarmRule || "",
						ActionsEnabled: compositeAlarm.ActionsEnabled ? "Yes" : "No",
						AlarmActions: (compositeAlarm.AlarmActions || []).join(", "),
						OKActions: (compositeAlarm.OKActions || []).join(", "),
						InsufficientDataActions: (
							compositeAlarm.InsufficientDataActions || []
						).join(", "),
					};
				}
			} else {
				// Simple text format
				if (metricAlarm) {
					const dimensions = (metricAlarm.Dimensions || [])
						.map((d) => `${d.Name}=${d.Value}`)
						.join(", ");

					return `Metric Alarm: ${metricAlarm.AlarmName || ""}
ARN: ${metricAlarm.AlarmArn || ""}
State: ${metricAlarm.StateValue || ""} (Updated: ${metricAlarm.StateUpdatedTimestamp?.toISOString() || "N/A"})
State Reason: ${metricAlarm.StateReason || "N/A"}
Metric: ${metricAlarm.Namespace || ""}:${metricAlarm.MetricName || ""}
Dimensions: ${dimensions || "None"}
Condition: ${metricAlarm.Statistic || ""} ${metricAlarm.ComparisonOperator || ""} ${metricAlarm.Threshold || ""}
Period: ${metricAlarm.Period || 0} seconds
Evaluation Periods: ${metricAlarm.EvaluationPeriods || 0}
Treat Missing Data: ${metricAlarm.TreatMissingData || "N/A"}
Actions Enabled: ${metricAlarm.ActionsEnabled ? "Yes" : "No"}
Alarm Actions: ${(metricAlarm.AlarmActions || []).join(", ") || "None"}
OK Actions: ${(metricAlarm.OKActions || []).join(", ") || "None"}
Insufficient Data Actions: ${(metricAlarm.InsufficientDataActions || []).join(", ") || "None"}`;
				} else if (compositeAlarm) {
					return `Composite Alarm: ${compositeAlarm.AlarmName || ""}
ARN: ${compositeAlarm.AlarmArn || ""}
State: ${compositeAlarm.StateValue || ""} (Updated: ${compositeAlarm.StateUpdatedTimestamp?.toISOString() || "N/A"})
State Reason: ${compositeAlarm.StateReason || "N/A"}
Alarm Rule: ${compositeAlarm.AlarmRule || "N/A"}
Actions Enabled: ${compositeAlarm.ActionsEnabled ? "Yes" : "No"}
Alarm Actions: ${(compositeAlarm.AlarmActions || []).join(", ") || "None"}
OK Actions: ${(compositeAlarm.OKActions || []).join(", ") || "None"}
Insufficient Data Actions: ${(compositeAlarm.InsufficientDataActions || []).join(", ") || "None"}`;
				}
			}
		} catch (error) {
			console.error(`Error describing CloudWatch alarm '${alarmName}':`, error);
			throw error;
		}
	}
}

export default new DescribeAlarmService();
