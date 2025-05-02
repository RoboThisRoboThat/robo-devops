import {
	CloudWatchClient,
	DeleteAlarmsCommand,
} from "@aws-sdk/client-cloudwatch";
import { z } from "zod";

class DeleteAlarmService {
	/**
	 * Deletes a CloudWatch alarm
	 * @param region The AWS region to use
	 * @param alarmName The name of the CloudWatch alarm to delete
	 * @returns Promise containing the result of the alarm deletion
	 */

	toolName = "delete-cloudwatch-alarm";
	description = "Deletes a specified CloudWatch alarm";
	deleteAlarmInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the alarm resides"),
		alarmName: z
			.string()
			.describe("The name of the CloudWatch alarm to delete"),
	};

	deleteAlarmZodInput = z.object(this.deleteAlarmInput);

	async deleteAlarm({
		region,
		alarmName,
	}: {
		region: string;
		alarmName: string;
	}) {
		try {
			// Create CloudWatch client for the specified region
			const cloudwatchClient = new CloudWatchClient({ region });

			const command = new DeleteAlarmsCommand({
				AlarmNames: [alarmName],
			});

			await cloudwatchClient.send(command);

			// Successfully deleted the alarm
			return {
				success: true,
				alarmName,
				message: `CloudWatch alarm '${alarmName}' deleted successfully.`,
			};
		} catch (error) {
			console.error(`Error deleting CloudWatch alarm '${alarmName}':`, error);
			throw error;
		}
	}
}

export default new DeleteAlarmService();
