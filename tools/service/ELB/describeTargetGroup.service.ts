import {
	ElasticLoadBalancingV2Client,
	DescribeTargetGroupsCommand,
	DescribeTargetHealthCommand,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { z } from "zod";

class DescribeTargetGroupService {
	/**
	 * Displays detailed information about a specific Target Group
	 */
	toolName = "describe-target-group";
	description = "Displays detailed information about a specific Target Group";

	describeTargetGroupInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		targetGroupIdentifier: z
			.string()
			.describe("Target Group ARN or name to describe"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Specifies the output format"),
	};

	describeTargetGroupZodInput = z.object(this.describeTargetGroupInput);

	/**
	 * Resolves a Target Group identifier (ARN or name) to an ARN
	 * @param client The ELBv2 client
	 * @param identifier The Target Group identifier (ARN or name)
	 * @returns Promise containing the Target Group ARN
	 */
	private async resolveTargetGroupIdentifier(
		client: ElasticLoadBalancingV2Client,
		identifier: string,
	): Promise<string> {
		// If the identifier is already an ARN, return it directly
		if (identifier.startsWith("arn:aws:elasticloadbalancing:")) {
			return identifier;
		}

		// Otherwise, try to find the Target Group by name
		const command = new DescribeTargetGroupsCommand({
			Names: [identifier],
		});

		try {
			const response = await client.send(command);
			if (
				!response.TargetGroups ||
				response.TargetGroups.length === 0 ||
				!response.TargetGroups[0].TargetGroupArn
			) {
				throw new Error(`Target Group with name ${identifier} not found`);
			}
			return response.TargetGroups[0].TargetGroupArn;
		} catch (error) {
			throw new Error(`Unable to resolve Target Group identifier: ${error}`);
		}
	}

	async describeTargetGroup({
		region,
		targetGroupIdentifier,
		outputFormat = "text",
	}: {
		region: string;
		targetGroupIdentifier: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Try to determine if the identifier is an ARN or a name
			let targetGroupArn: string;

			if (targetGroupIdentifier.startsWith("arn:aws:elasticloadbalancing:")) {
				targetGroupArn = targetGroupIdentifier;
			} else {
				// Try to find the Target Group by name
				targetGroupArn = await this.resolveTargetGroupIdentifier(
					client,
					targetGroupIdentifier,
				);
			}

			// Get the Target Group details
			const tgCommand = new DescribeTargetGroupsCommand({
				TargetGroupArns: [targetGroupArn],
			});

			const tgResponse = await client.send(tgCommand);

			if (!tgResponse.TargetGroups || tgResponse.TargetGroups.length === 0) {
				throw new Error(`Target Group ${targetGroupIdentifier} not found`);
			}

			const targetGroup = tgResponse.TargetGroups[0];

			// Get the target health information
			const healthCommand = new DescribeTargetHealthCommand({
				TargetGroupArn: targetGroupArn,
			});

			const healthResponse = await client.send(healthCommand);

			// Format the response
			return {
				details: {
					name: targetGroup.TargetGroupName,
					arn: targetGroup.TargetGroupArn,
					protocol: targetGroup.Protocol,
					port: targetGroup.Port,
					vpcId: targetGroup.VpcId,
					targetType: targetGroup.TargetType,
					healthCheckEnabled: targetGroup.HealthCheckEnabled,
					healthCheckProtocol: targetGroup.HealthCheckProtocol,
					healthCheckPath: targetGroup.HealthCheckPath,
					healthCheckPort: targetGroup.HealthCheckPort,
					healthCheckIntervalSeconds: targetGroup.HealthCheckIntervalSeconds,
					healthCheckTimeoutSeconds: targetGroup.HealthCheckTimeoutSeconds,
					healthyThresholdCount: targetGroup.HealthyThresholdCount,
					unhealthyThresholdCount: targetGroup.UnhealthyThresholdCount,
					matcher: targetGroup.Matcher,
					loadBalancerArns: targetGroup.LoadBalancerArns,
				},
				targets:
					healthResponse.TargetHealthDescriptions?.map((thd: any) => ({
						id: thd.Target?.Id,
						port: thd.Target?.Port,
						state: thd.TargetHealth?.State,
						reason: thd.TargetHealth?.Reason,
						description: thd.TargetHealth?.Description,
					})) || [],
			};
		} catch (error) {
			console.error("Error describing Target Group:", error);
			throw error;
		}
	}
}

export default new DescribeTargetGroupService();
