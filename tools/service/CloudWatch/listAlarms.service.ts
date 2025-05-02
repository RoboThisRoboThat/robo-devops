import {
	CloudWatchClient,
	DescribeAlarmsCommand,
	type StateValue,
} from "@aws-sdk/client-cloudwatch";
import { z } from "zod";

class ListAlarmsService {
	/**
	 * Lists CloudWatch alarms with optional filtering
	 * @param region The AWS region to use
	 * @param alarmNames Optional list of alarm names to retrieve
	 * @param stateValue Optional filter by alarm state
	 * @param actionPrefix Optional filter by action prefix
	 * @param alarmNamePrefix Optional filter by alarm name prefix
	 * @returns Promise containing the list of CloudWatch alarms
	 */

	toolName = "list-cloudwatch-alarms";
	description = "Retrieves a detailed list of CloudWatch alarms";
	listAlarmsInput = {
		region: z.string().describe("Specifies the AWS region to query"),
		alarmNames: z
			.array(z.string())
			.optional()
			.describe("A comma-separated list of alarm names to retrieve"),
		stateValue: z
			.enum(["OK", "ALARM", "INSUFFICIENT_DATA"])
			.optional()
			.describe("Filters the results by the state of the alarm"),
		actionPrefix: z
			.string()
			.optional()
			.describe("Filters the results by an action prefix"),
		alarmNamePrefix: z
			.string()
			.optional()
			.describe("Filters the results by a name prefix"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("json")
			.describe("Specifies the output format"),
	};

	listAlarmsZodInput = z.object(this.listAlarmsInput);

	async listAlarms({
		region,
		alarmNames,
		stateValue,
		actionPrefix,
		alarmNamePrefix,
		outputFormat = "json",
	}: {
		region: string;
		alarmNames?: string[];
		stateValue?: StateValue;
		actionPrefix?: string;
		alarmNamePrefix?: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create CloudWatch client for the specified region
			const cloudwatchClient = new CloudWatchClient({ region });

			// Prepare command parameters
			const params: any = {};

			if (alarmNames && alarmNames.length > 0) {
				params.AlarmNames = alarmNames;
			}

			if (stateValue) {
				params.StateValue = stateValue;
			}

			if (actionPrefix) {
				params.ActionPrefix = actionPrefix;
			}

			if (alarmNamePrefix) {
				params.AlarmNamePrefix = alarmNamePrefix;
			}

			const command = new DescribeAlarmsCommand(params);
			const response = await cloudwatchClient.send(command);

			// Process and format the response based on outputFormat
			const metricAlarms = response.MetricAlarms || [];
			const compositeAlarms = response.CompositeAlarms || [];

			if (outputFormat === "json") {
				return {
					metricAlarms,
					compositeAlarms,
					nextToken: response.NextToken,
				};
			} else if (outputFormat === "table") {
				// Return a structure suitable for table display
				const metricAlarmsTable = metricAlarms.map((alarm) => ({
					AlarmName: alarm.AlarmName || "",
					AlarmArn: alarm.AlarmArn || "",
					StateValue: alarm.StateValue || "",
					MetricName: alarm.MetricName || "",
					Namespace: alarm.Namespace || "",
					Statistic: alarm.Statistic || "",
					Threshold: alarm.Threshold || null,
					ComparisonOperator: alarm.ComparisonOperator || "",
					ActionsEnabled: alarm.ActionsEnabled || false,
				}));

				const compositeAlarmsTable = compositeAlarms.map((alarm) => ({
					AlarmName: alarm.AlarmName || "",
					AlarmArn: alarm.AlarmArn || "",
					StateValue: alarm.StateValue || "",
					AlarmRule: alarm.AlarmRule || "",
					ActionsEnabled: alarm.ActionsEnabled || false,
				}));

				return {
					metricAlarms: metricAlarmsTable,
					compositeAlarms: compositeAlarmsTable,
					nextToken: response.NextToken,
				};
			} else {
				// Simple text format
				const metricAlarmsText = metricAlarms
					.map((alarm) => {
						return `Metric Alarm: ${alarm.AlarmName || "Unnamed"} [${alarm.StateValue || "Unknown State"}]
  ARN: ${alarm.AlarmArn || "N/A"}
  Metric: ${alarm.Namespace || "N/A"}:${alarm.MetricName || "N/A"}
  Condition: ${alarm.Statistic || ""} ${alarm.ComparisonOperator || ""} ${alarm.Threshold || ""}
  Actions Enabled: ${alarm.ActionsEnabled ? "Yes" : "No"}`;
					})
					.join("\n\n");

				const compositeAlarmsText = compositeAlarms
					.map((alarm) => {
						return `Composite Alarm: ${alarm.AlarmName || "Unnamed"} [${alarm.StateValue || "Unknown State"}]
  ARN: ${alarm.AlarmArn || "N/A"}
  Rule: ${alarm.AlarmRule || "N/A"}
  Actions Enabled: ${alarm.ActionsEnabled ? "Yes" : "No"}`;
					})
					.join("\n\n");

				let result = "";
				if (metricAlarms.length > 0) {
					result += `=== Metric Alarms ===\n${metricAlarmsText}`;
				}

				if (compositeAlarms.length > 0) {
					if (result) result += "\n\n";
					result += `=== Composite Alarms ===\n${compositeAlarmsText}`;
				}

				return result || "No alarms found.";
			}
		} catch (error) {
			console.error("Error listing CloudWatch alarms:", error);
			throw error;
		}
	}
}

export default new ListAlarmsService();
