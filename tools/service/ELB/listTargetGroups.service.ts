import {
	ElasticLoadBalancingV2Client,
	DescribeTargetGroupsCommand,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { z } from "zod";

class ListTargetGroupsService {
	/**
	 * Lists Target Groups in the specified AWS region
	 */
	toolName = "list-target-groups";
	description = "Retrieves and displays a detailed list of Target Groups";

	listTargetGroupsInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		vpcId: z
			.string()
			.optional()
			.describe(
				"If provided, filters the output to display only Target Groups associated with the specified VPC ID",
			),
		nameFilter: z
			.string()
			.optional()
			.describe(
				"Allows filtering the list based on a substring match in the Target Group name",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Specifies the desired output format"),
	};

	listTargetGroupsZodInput = z.object(this.listTargetGroupsInput);

	async listTargetGroups({
		region,
		vpcId,
		nameFilter,
		outputFormat = "text",
	}: {
		region: string;
		vpcId?: string;
		nameFilter?: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });
			const command = new DescribeTargetGroupsCommand({});

			const response = await client.send(command);

			if (!response.TargetGroups) {
				return { targetGroups: [] };
			}

			// Filter Target Groups if necessary
			let filteredGroups = response.TargetGroups;

			if (vpcId) {
				filteredGroups = filteredGroups.filter((tg: any) => tg.VpcId === vpcId);
			}

			if (nameFilter) {
				filteredGroups = filteredGroups.filter((tg: any) =>
					tg.TargetGroupName?.toLowerCase().includes(nameFilter.toLowerCase()),
				);
			}

			// Format the results
			const formattedGroups = filteredGroups.map((tg: any) => ({
				name: tg.TargetGroupName,
				arn: tg.TargetGroupArn,
				protocol: tg.Protocol,
				port: tg.Port,
				targetType: tg.TargetType,
				vpcId: tg.VpcId,
				healthCheckEnabled: tg.HealthCheckEnabled,
				healthCheckProtocol: tg.HealthCheckProtocol,
				healthCheckPath: tg.HealthCheckPath,
			}));

			return { targetGroups: formattedGroups };
		} catch (error) {
			console.error("Error listing Target Groups:", error);
			throw error;
		}
	}
}

export default new ListTargetGroupsService();
