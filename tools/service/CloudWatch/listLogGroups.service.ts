import {
	CloudWatchLogsClient,
	DescribeLogGroupsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { z } from "zod";
import BaseService from "../base.service";

class ListLogGroupsService {
	/**
	 * Lists CloudWatch Log Groups with optional filtering
	 * @param region The AWS region to use
	 * @param logGroupNamePrefix Optional prefix to filter log groups by name
	 * @returns Promise containing the list of CloudWatch Log Groups
	 */

	toolName = "list-cloudwatch-log-groups";
	description = "Retrieves a detailed list of CloudWatch Log Groups";
	listLogGroupsInput = {
		region: z.string().describe("Specifies the AWS region to query"),
		logGroupNamePrefix: z
			.string()
			.optional()
			.describe(
				"Filters the results to include only log groups whose names start with the specified prefix",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("json")
			.describe("Specifies the output format"),
	};

	listLogGroupsZodInput = z.object(this.listLogGroupsInput);

	async listLogGroups(params: Record<string, unknown>) {
		const {
			region,
			logGroupNamePrefix,
			outputFormat = "json",
		} = params as {
			region: string;
			logGroupNamePrefix?: string;
			outputFormat?: "text" | "json" | "table";
		};

		try {
			// Create CloudWatch Logs client for the specified region
			const cloudwatchLogsClient = new CloudWatchLogsClient({ region });

			// Prepare command parameters
			const cmdParams: any = {};

			if (logGroupNamePrefix) {
				cmdParams.logGroupNamePrefix = logGroupNamePrefix;
			}

			const command = new DescribeLogGroupsCommand(cmdParams);
			const response = await cloudwatchLogsClient.send(command);

			// Process and format the response based on outputFormat
			const logGroups = response.logGroups || [];

			if (outputFormat === "json") {
				return {
					logGroups,
					nextToken: response.nextToken,
				};
			} else if (outputFormat === "table") {
				// Return a structure suitable for table display
				const logGroupsTable = logGroups.map((group) => ({
					LogGroupName: group.logGroupName || "",
					Arn: group.arn || "",
					CreationTime: group.creationTime
						? new Date(group.creationTime).toISOString()
						: "",
					RetentionInDays: group.retentionInDays || "Never expire",
					StoredBytes: group.storedBytes || 0,
					MetricFilterCount: group.metricFilterCount || 0,
					KmsKeyId: group.kmsKeyId || "Not encrypted",
				}));

				return {
					logGroups: logGroupsTable,
					nextToken: response.nextToken,
				};
			} else {
				// Simple text format
				const logGroupsText = logGroups
					.map((group) => {
						const creationTime = group.creationTime
							? new Date(group.creationTime).toISOString()
							: "Unknown";
						const retention = group.retentionInDays
							? `${group.retentionInDays} days`
							: "Never expire";
						const storedBytes = group.storedBytes
							? `${group.storedBytes} bytes`
							: "0 bytes";

						return `Log Group: ${group.logGroupName || ""}
  ARN: ${group.arn || ""}
  Created: ${creationTime}
  Retention: ${retention}
  Stored: ${storedBytes}
  Metric Filters: ${group.metricFilterCount || 0}
  KMS Key: ${group.kmsKeyId || "Not encrypted"}`;
					})
					.join("\n\n");

				return logGroupsText || "No log groups found.";
			}
		} catch (error) {
			console.error("Error listing CloudWatch Log Groups:", error);
			throw error;
		}
	}
}

const listLogGroupsService = new ListLogGroupsService();

export default new BaseService(
	listLogGroupsService.toolName,
	listLogGroupsService.description,
	listLogGroupsService.listLogGroupsInput,
	listLogGroupsService.listLogGroupsZodInput,
	listLogGroupsService.listLogGroups,
);
