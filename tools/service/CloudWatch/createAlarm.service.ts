import {
	CloudWatchClient,
	PutMetricAlarmCommand,
	type ComparisonOperator,
	type Dimension,
	type Statistic,
	type TreatMissingData,
} from "@aws-sdk/client-cloudwatch";
import { z } from "zod";

class CreateAlarmService {
	/**
	 * Creates a new CloudWatch alarm to monitor a metric
	 * @param region The AWS region to use
	 * @param alarmName The name of the new CloudWatch alarm
	 * @param metricName The name of the metric to monitor
	 * @param namespace The namespace of the metric
	 * @param statistic The statistic to apply to the metric
	 * @param dimensions Optional dimensions for the metric
	 * @param period The evaluation period for the alarm, in seconds
	 * @param evaluationPeriods The number of evaluation periods to consider
	 * @param threshold The value against which the specified statistic is compared
	 * @param comparisonOperator The arithmetic operation to use
	 * @param alarmActions Optional ARNs for the actions to execute when in ALARM state
	 * @param okActions Optional ARNs for the actions to execute when in OK state
	 * @param insufficientDataActions Optional ARNs for the actions to execute when in INSUFFICIENT_DATA state
	 * @param unit Optional unit of the metric
	 * @param treatMissingData Optional handling of missing data points
	 * @param evaluateLowSampleCountPercentile Optional handling of low data sample counts
	 * @param alarmDescription Optional description for the alarm
	 * @param actionsEnabled Optional flag to enable/disable actions
	 * @param tags Optional tags to assign to the new alarm
	 * @returns Promise containing the result of the alarm creation
	 */

	toolName = "create-cloudwatch-alarm";
	description = "Creates a new CloudWatch alarm";
	createAlarmInput = {
		region: z
			.string()
			.describe("Specifies the AWS region in which to create the alarm"),
		alarmName: z
			.string()
			.describe("The name of the new CloudWatch alarm (e.g., `LowDiskSpace`)"),
		metricName: z
			.string()
			.describe(
				"The name of the metric to monitor (e.g., `DiskSpaceUtilization`)",
			),
		namespace: z
			.string()
			.describe("The namespace of the metric (e.g., `AWS/EC2`)"),
		statistic: z
			.string()
			.describe(
				"The statistic to apply to the metric (`SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`, `pXX.XX`)",
			),
		dimensions: z
			.array(
				z.object({
					Name: z.string().describe("Dimension name"),
					Value: z.string().describe("Dimension value"),
				}),
			)
			.optional()
			.describe(
				"A JSON string or a path to a JSON file specifying the dimensions for the metric",
			),
		period: z
			.number()
			.describe("The evaluation period for the alarm, in seconds (e.g., `60`)"),
		evaluationPeriods: z
			.number()
			.describe(
				"The number of evaluation periods to consider when assessing the alarm state",
			),
		threshold: z
			.number()
			.describe("The value against which the specified statistic is compared"),
		comparisonOperator: z
			.enum([
				"GreaterThanOrEqualToThreshold",
				"GreaterThanThreshold",
				"LessThanOrEqualToThreshold",
				"LessThanThreshold",
				"LessThanLowerOrGreaterThanUpperThreshold",
				"LessThanLowerThreshold",
				"GreaterThanUpperThreshold",
			])
			.describe(
				"The arithmetic operation to use when comparing the statistic and threshold",
			),
		alarmActions: z
			.array(z.string())
			.optional()
			.describe(
				"A comma-separated list of ARNs for the actions to execute when the alarm enters the `ALARM` state (e.g., SNS topic ARNs)",
			),
		okActions: z
			.array(z.string())
			.optional()
			.describe(
				"A comma-separated list of ARNs for the actions to execute when the alarm enters the `OK` state",
			),
		insufficientDataActions: z
			.array(z.string())
			.optional()
			.describe(
				"A comma-separated list of ARNs for the actions to execute when the alarm enters the `INSUFFICIENT_DATA` state",
			),
		unit: z.string().optional().describe("The unit of the metric"),
		treatMissingData: z
			.enum(["missing", "ignore", "breaching", "notBreaching"])
			.optional()
			.default("missing")
			.describe("Specifies how missing data points are treated"),
		evaluateLowSampleCountPercentile: z
			.string()
			.optional()
			.describe(
				"Used for percentile statistics to specify how to handle low data sample counts",
			),
		alarmDescription: z
			.string()
			.optional()
			.describe("A description for the alarm"),
		actionsEnabled: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Indicates whether actions should be executed when the alarm state changes",
			),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe("A list of key-value pairs to assign as tags to the new alarm"),
	};

	createAlarmZodInput = z.object(this.createAlarmInput);

	async createAlarm({
		region,
		alarmName,
		metricName,
		namespace,
		statistic,
		dimensions = [],
		period,
		evaluationPeriods,
		threshold,
		comparisonOperator,
		alarmActions = [],
		okActions = [],
		insufficientDataActions = [],
		unit,
		treatMissingData = "missing",
		evaluateLowSampleCountPercentile,
		alarmDescription,
		actionsEnabled = true,
		tags = [],
	}: {
		region: string;
		alarmName: string;
		metricName: string;
		namespace: string;
		statistic: string;
		dimensions?: Dimension[];
		period: number;
		evaluationPeriods: number;
		threshold: number;
		comparisonOperator: ComparisonOperator;
		alarmActions?: string[];
		okActions?: string[];
		insufficientDataActions?: string[];
		unit?: string;
		treatMissingData?: TreatMissingData;
		evaluateLowSampleCountPercentile?: string;
		alarmDescription?: string;
		actionsEnabled?: boolean;
		tags?: { Key: string; Value: string }[];
	}) {
		try {
			// Create CloudWatch client for the specified region
			const cloudwatchClient = new CloudWatchClient({ region });

			// Determine if statistic is a percentile
			let statisticValue: Statistic | undefined;
			let extendedStatistic: string | undefined;

			if (statistic.startsWith("p")) {
				// It's a percentile
				extendedStatistic = statistic;
			} else {
				// It's a standard statistic
				statisticValue = statistic as Statistic;
			}

			// Prepare the command parameters
			const params: any = {
				AlarmName: alarmName,
				MetricName: metricName,
				Namespace: namespace,
				Period: period,
				EvaluationPeriods: evaluationPeriods,
				Threshold: threshold,
				ComparisonOperator: comparisonOperator,
				ActionsEnabled: actionsEnabled,
				TreatMissingData: treatMissingData,
			};

			// Set the appropriate statistic type
			if (statisticValue) {
				params.Statistic = statisticValue;
			} else if (extendedStatistic) {
				params.ExtendedStatistic = extendedStatistic;
			}

			// Add optional parameters if provided
			if (dimensions.length > 0) {
				params.Dimensions = dimensions;
			}

			if (alarmActions.length > 0) {
				params.AlarmActions = alarmActions;
			}

			if (okActions.length > 0) {
				params.OKActions = okActions;
			}

			if (insufficientDataActions.length > 0) {
				params.InsufficientDataActions = insufficientDataActions;
			}

			if (unit) {
				params.Unit = unit;
			}

			if (evaluateLowSampleCountPercentile) {
				params.EvaluateLowSampleCountPercentile =
					evaluateLowSampleCountPercentile;
			}

			if (alarmDescription) {
				params.AlarmDescription = alarmDescription;
			}

			if (tags.length > 0) {
				params.Tags = tags;
			}

			const command = new PutMetricAlarmCommand(params);
			await cloudwatchClient.send(command);

			// Successfully created the alarm
			return {
				success: true,
				alarmName,
				message: `CloudWatch alarm '${alarmName}' created successfully.`,
			};
		} catch (error) {
			console.error(`Error creating CloudWatch alarm '${alarmName}':`, error);
			throw error;
		}
	}
}

export default new CreateAlarmService();
