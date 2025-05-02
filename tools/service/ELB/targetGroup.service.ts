import {
	ElasticLoadBalancingV2Client,
	DescribeTargetGroupsCommand,
	CreateTargetGroupCommand,
	RegisterTargetsCommand,
	DeregisterTargetsCommand,
	ModifyTargetGroupCommand,
	DeleteTargetGroupCommand,
	DescribeTargetHealthCommand,
	type TargetGroupAttribute,
	type TargetDescription,
	type Tag,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { z } from "zod";

class TargetGroupService {
	/**
	 * AWS Target Group management tool
	 * Provides comprehensive management capabilities for AWS Target Groups within a specified AWS region
	 */

	toolName = "aws-tg-manager";
	description = "AWS Target Group management tool for ELB";

	listTargetGroupsInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		vpcId: z
			.string()
			.optional()
			.describe(
				"If provided, filters output to display only Target Groups associated with the specified VPC ID",
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
			.describe("Output format (text, json, or table)"),
	};

	describeTargetGroupInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		targetGroupIdentifier: z
			.string()
			.describe("Target Group ARN or name to describe"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Output format (text, json, or table)"),
	};

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

	registerTargetsInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		targetGroupIdentifier: z.string().describe("Target Group ARN or name"),
		targets: z
			.string()
			.describe(
				"Comma-separated list of targets to register (format depends on target type)",
			),
		port: z
			.number()
			.int()
			.min(1)
			.max(65535)
			.optional()
			.describe(
				"Port to use when registering targets (overrides Target Group default port)",
			),
	};

	deregisterTargetsInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		targetGroupIdentifier: z.string().describe("Target Group ARN or name"),
		targets: z
			.string()
			.describe("Comma-separated list of targets to deregister"),
	};

	updateHealthCheckInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		targetGroupIdentifier: z.string().describe("Target Group ARN or name"),
		healthCheckProtocol: z
			.enum(["HTTP", "HTTPS", "TCP"])
			.optional()
			.describe("New protocol to use for health checks"),
		healthCheckPath: z
			.string()
			.optional()
			.describe("New destination for health checks"),
		healthCheckPort: z
			.string()
			.optional()
			.describe("New port to use for health checks"),
		healthCheckInterval: z
			.number()
			.int()
			.min(5)
			.max(300)
			.optional()
			.describe("New health check interval in seconds"),
		healthCheckTimeout: z
			.number()
			.int()
			.min(2)
			.max(60)
			.optional()
			.describe("New health check timeout in seconds"),
		healthyThresholdCount: z
			.number()
			.int()
			.min(2)
			.max(10)
			.optional()
			.describe("New number of healthy checks required"),
		unhealthyThresholdCount: z
			.number()
			.int()
			.min(2)
			.max(10)
			.optional()
			.describe("New number of unhealthy checks required"),
		matcherHttpCode: z
			.string()
			.optional()
			.describe("New HTTP codes for successful responses"),
	};

	deleteTargetGroupInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		targetGroupIdentifier: z
			.string()
			.describe("Target Group ARN or name to delete"),
		force: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"If true, bypasses the confirmation prompt and immediately deletes the Target Group",
			),
	};

	listTargetGroupsZodInput = z.object(this.listTargetGroupsInput);
	describeTargetGroupZodInput = z.object(this.describeTargetGroupInput);
	createTargetGroupZodInput = z.object(this.createTargetGroupInput);
	registerTargetsZodInput = z.object(this.registerTargetsInput);
	deregisterTargetsZodInput = z.object(this.deregisterTargetsInput);
	updateHealthCheckZodInput = z.object(this.updateHealthCheckInput);
	deleteTargetGroupZodInput = z.object(this.deleteTargetGroupInput);

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

	/**
	 * Lists Target Groups in the specified AWS region
	 */
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
				filteredGroups = filteredGroups.filter((tg) => tg.VpcId === vpcId);
			}

			if (nameFilter) {
				filteredGroups = filteredGroups.filter(
					(tg) =>
						tg.TargetGroupName &&
						tg.TargetGroupName.toLowerCase().includes(nameFilter.toLowerCase()),
				);
			}

			// Format the results
			const formattedGroups = filteredGroups.map((tg) => ({
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

	/**
	 * Describes a specific Target Group
	 */
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
					healthResponse.TargetHealthDescriptions?.map((thd) => ({
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

	/**
	 * Creates a new Target Group
	 */
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

	/**
	 * Registers targets with a Target Group
	 */
	async registerTargets({
		region,
		targetGroupIdentifier,
		targets,
		port,
	}: {
		region: string;
		targetGroupIdentifier: string;
		targets: string;
		port?: number;
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Resolve the Target Group ARN
			const targetGroupArn = await this.resolveTargetGroupIdentifier(
				client,
				targetGroupIdentifier,
			);

			// Get the Target Group details to determine target type
			const tgCommand = new DescribeTargetGroupsCommand({
				TargetGroupArns: [targetGroupArn],
			});

			const tgResponse = await client.send(tgCommand);

			if (!tgResponse.TargetGroups || tgResponse.TargetGroups.length === 0) {
				throw new Error(`Target Group ${targetGroupIdentifier} not found`);
			}

			const targetType = tgResponse.TargetGroups[0].TargetType || "instance";

			// Parse the targets based on target type
			const targetList = targets.split(",").map((target) => target.trim());
			const targetDescriptions: TargetDescription[] = [];

			for (const target of targetList) {
				if (targetType === "instance") {
					// For instance targets (instance IDs)
					targetDescriptions.push({
						Id: target,
						Port: port,
					});
				} else if (targetType === "ip") {
					// For IP targets, which may include port information
					const [ip, ipPort] = target.split(":");
					targetDescriptions.push({
						Id: ip,
						Port: ipPort ? parseInt(ipPort, 10) : port,
					});
				} else if (targetType === "lambda" || targetType === "alb") {
					// For Lambda or ALB targets (ARNs)
					targetDescriptions.push({
						Id: target,
					});
				}
			}

			const command = new RegisterTargetsCommand({
				TargetGroupArn: targetGroupArn,
				Targets: targetDescriptions,
			});

			await client.send(command);

			return {
				message: `Successfully registered ${targetDescriptions.length} targets with target group ${targetGroupIdentifier}`,
				registeredTargets: targetDescriptions.map((td) => ({
					id: td.Id,
					port: td.Port,
				})),
			};
		} catch (error) {
			console.error("Error registering targets:", error);
			throw error;
		}
	}

	/**
	 * Deregisters targets from a Target Group
	 */
	async deregisterTargets({
		region,
		targetGroupIdentifier,
		targets,
	}: {
		region: string;
		targetGroupIdentifier: string;
		targets: string;
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Resolve the Target Group ARN
			const targetGroupArn = await this.resolveTargetGroupIdentifier(
				client,
				targetGroupIdentifier,
			);

			// Get the Target Group details to determine target type
			const tgCommand = new DescribeTargetGroupsCommand({
				TargetGroupArns: [targetGroupArn],
			});

			const tgResponse = await client.send(tgCommand);

			if (!tgResponse.TargetGroups || tgResponse.TargetGroups.length === 0) {
				throw new Error(`Target Group ${targetGroupIdentifier} not found`);
			}

			const targetType = tgResponse.TargetGroups[0].TargetType || "instance";

			// Parse the targets based on target type
			const targetList = targets.split(",").map((target) => target.trim());
			const targetDescriptions: TargetDescription[] = [];

			for (const target of targetList) {
				if (targetType === "ip") {
					// For IP targets, which may include port information
					const [ip, port] = target.split(":");
					targetDescriptions.push({
						Id: ip,
						Port: port ? parseInt(port, 10) : undefined,
					});
				} else {
					// For instance, Lambda, or ALB targets
					targetDescriptions.push({
						Id: target,
					});
				}
			}

			const command = new DeregisterTargetsCommand({
				TargetGroupArn: targetGroupArn,
				Targets: targetDescriptions,
			});

			await client.send(command);

			return {
				message: `Successfully deregistered ${targetDescriptions.length} targets from target group ${targetGroupIdentifier}`,
				deregisteredTargets: targetDescriptions.map((td) => ({
					id: td.Id,
					port: td.Port,
				})),
			};
		} catch (error) {
			console.error("Error deregistering targets:", error);
			throw error;
		}
	}

	/**
	 * Updates health check settings for a Target Group
	 */
	async updateHealthCheck({
		region,
		targetGroupIdentifier,
		healthCheckProtocol,
		healthCheckPath,
		healthCheckPort,
		healthCheckInterval,
		healthCheckTimeout,
		healthyThresholdCount,
		unhealthyThresholdCount,
		matcherHttpCode,
	}: {
		region: string;
		targetGroupIdentifier: string;
		healthCheckProtocol?: "HTTP" | "HTTPS" | "TCP";
		healthCheckPath?: string;
		healthCheckPort?: string;
		healthCheckInterval?: number;
		healthCheckTimeout?: number;
		healthyThresholdCount?: number;
		unhealthyThresholdCount?: number;
		matcherHttpCode?: string;
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Resolve the Target Group ARN
			const targetGroupArn = await this.resolveTargetGroupIdentifier(
				client,
				targetGroupIdentifier,
			);

			// Prepare the command
			const command = new ModifyTargetGroupCommand({
				TargetGroupArn: targetGroupArn,
				HealthCheckProtocol: healthCheckProtocol,
				HealthCheckPath: healthCheckPath,
				HealthCheckPort: healthCheckPort,
				HealthCheckIntervalSeconds: healthCheckInterval,
				HealthCheckTimeoutSeconds: healthCheckTimeout,
				HealthyThresholdCount: healthyThresholdCount,
				UnhealthyThresholdCount: unhealthyThresholdCount,
				Matcher: matcherHttpCode ? { HttpCode: matcherHttpCode } : undefined,
			});

			const response = await client.send(command);

			return {
				message: `Successfully updated health check settings for target group ${targetGroupIdentifier}`,
				targetGroupArn: targetGroupArn,
				updatedSettings: {
					healthCheckProtocol,
					healthCheckPath,
					healthCheckPort,
					healthCheckInterval,
					healthCheckTimeout,
					healthyThresholdCount,
					unhealthyThresholdCount,
					matcherHttpCode,
				},
			};
		} catch (error) {
			console.error("Error updating health check settings:", error);
			throw error;
		}
	}

	/**
	 * Deletes a Target Group
	 */
	async deleteTargetGroup({
		region,
		targetGroupIdentifier,
		force = false,
	}: {
		region: string;
		targetGroupIdentifier: string;
		force?: boolean;
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Resolve the Target Group ARN
			const targetGroupArn = await this.resolveTargetGroupIdentifier(
				client,
				targetGroupIdentifier,
			);

			// Check if the Target Group is in use by any Load Balancers if not forced
			if (!force) {
				const command = new DescribeTargetGroupsCommand({
					TargetGroupArns: [targetGroupArn],
				});

				const response = await client.send(command);

				if (
					response.TargetGroups &&
					response.TargetGroups.length > 0 &&
					response.TargetGroups[0].LoadBalancerArns &&
					response.TargetGroups[0].LoadBalancerArns.length > 0
				) {
					throw new Error(
						`Target Group ${targetGroupIdentifier} is still in use by ${response.TargetGroups[0].LoadBalancerArns.length} load balancer(s). ` +
							`Use --force to delete anyway.`,
					);
				}
			}

			// Delete the Target Group
			const deleteCommand = new DeleteTargetGroupCommand({
				TargetGroupArn: targetGroupArn,
			});

			await client.send(deleteCommand);

			return {
				message: `Successfully deleted target group ${targetGroupIdentifier}`,
				targetGroupArn: targetGroupArn,
			};
		} catch (error) {
			console.error("Error deleting Target Group:", error);
			throw error;
		}
	}
}

export default new TargetGroupService();
