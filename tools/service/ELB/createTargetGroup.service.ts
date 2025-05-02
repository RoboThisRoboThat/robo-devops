import {
	ElasticLoadBalancingV2Client,
	CreateTargetGroupCommand,
	type Tag,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { z } from "zod";

class CreateTargetGroupService {
	/**
	 * Creates a new Target Group with specified configurations
	 */
	toolName = "create-target-group";
	description = "Creates a new Target Group with specified configurations";

	createTargetGroupInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		name: z
			.string()
			.describe("Name of the new Target Group (e.g., 'backend-pool')"),
		protocol: z
			.enum(["HTTP", "HTTPS", "TCP", "TLS", "UDP", "TCP_UDP"])
			.describe("Protocol to use for routing traffic to the targets"),
		port: z
			.number()
			.int()
			.min(1)
			.max(65535)
			.describe("Port on which the targets receive traffic"),
		vpcId: z
			.string()
			.describe("ID of the VPC in which to create the Target Group"),
		targetType: z
			.enum(["instance", "ip", "lambda", "alb"])
			.optional()
			.default("instance")
			.describe(
				"Type of targets that can be registered with this Target Group",
			),
		healthCheckProtocol: z
			.enum(["HTTP", "HTTPS", "TCP"])
			.optional()
			.default("HTTP")
			.describe("Protocol to use for health checks"),
		healthCheckPath: z
			.string()
			.optional()
			.default("/")
			.describe("Destination for health checks on the targets"),
		healthCheckPort: z
			.string()
			.optional()
			.default("traffic-port")
			.describe("Port to use for health checks"),
		healthCheckInterval: z
			.number()
			.int()
			.min(5)
			.max(300)
			.optional()
			.default(30)
			.describe("Approximate interval, in seconds, between health checks"),
		healthCheckTimeout: z
			.number()
			.int()
			.min(2)
			.max(60)
			.optional()
			.default(5)
			.describe(
				"Amount of time, in seconds, during which no response means a failed health check",
			),
		healthyThresholdCount: z
			.number()
			.int()
			.min(2)
			.max(10)
			.optional()
			.default(5)
			.describe(
				"Number of consecutive health checks successes required before considering an unhealthy target healthy",
			),
		unhealthyThresholdCount: z
			.number()
			.int()
			.min(2)
			.max(10)
			.optional()
			.default(2)
			.describe(
				"Number of consecutive health check failures required before considering a target unhealthy",
			),
		matcherHttpCode: z
			.string()
			.optional()
			.default("200")
			.describe(
				"HTTP codes to use when checking for a successful response from a target",
			),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe("Tags to assign to the new Target Group"),
	};

	createTargetGroupZodInput = z.object(this.createTargetGroupInput);

	async createTargetGroup({
		region,
		name,
		protocol,
		port,
		vpcId,
		targetType = "instance",
		healthCheckProtocol = "HTTP",
		healthCheckPath = "/",
		healthCheckPort = "traffic-port",
		healthCheckInterval = 30,
		healthCheckTimeout = 5,
		healthyThresholdCount = 5,
		unhealthyThresholdCount = 2,
		matcherHttpCode = "200",
		tags,
	}: {
		region: string;
		name: string;
		protocol: "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP" | "TCP_UDP";
		port: number;
		vpcId: string;
		targetType?: "instance" | "ip" | "lambda" | "alb";
		healthCheckProtocol?: "HTTP" | "HTTPS" | "TCP";
		healthCheckPath?: string;
		healthCheckPort?: string;
		healthCheckInterval?: number;
		healthCheckTimeout?: number;
		healthyThresholdCount?: number;
		unhealthyThresholdCount?: number;
		matcherHttpCode?: string;
		tags?: { Key: string; Value: string }[];
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Prepare matcher depending on protocol
			const matcher =
				healthCheckProtocol === "HTTP" || healthCheckProtocol === "HTTPS"
					? { HttpCode: matcherHttpCode }
					: undefined;

			const command = new CreateTargetGroupCommand({
				Name: name,
				Protocol: protocol,
				Port: port,
				VpcId: vpcId,
				TargetType: targetType,
				HealthCheckProtocol: healthCheckProtocol,
				HealthCheckPath:
					healthCheckProtocol === "HTTP" || healthCheckProtocol === "HTTPS"
						? healthCheckPath
						: undefined,
				HealthCheckPort: healthCheckPort,
				HealthCheckIntervalSeconds: healthCheckInterval,
				HealthCheckTimeoutSeconds: healthCheckTimeout,
				HealthyThresholdCount: healthyThresholdCount,
				UnhealthyThresholdCount: unhealthyThresholdCount,
				Matcher: matcher,
				Tags: tags as Tag[],
			});

			const response = await client.send(command);

			if (!response.TargetGroups || response.TargetGroups.length === 0) {
				throw new Error("Failed to create Target Group");
			}

			const targetGroup = response.TargetGroups[0];

			return {
				name: targetGroup.TargetGroupName,
				arn: targetGroup.TargetGroupArn,
				protocol: targetGroup.Protocol,
				port: targetGroup.Port,
				vpcId: targetGroup.VpcId,
				targetType: targetGroup.TargetType,
			};
		} catch (error) {
			console.error("Error creating Target Group:", error);
			throw error;
		}
	}
}

export default new CreateTargetGroupService();
