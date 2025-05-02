import {
	ElasticLoadBalancingV2Client,
	DescribeLoadBalancersCommand,
	CreateLoadBalancerCommand,
	CreateListenerCommand,
	DeleteListenerCommand,
	DeleteLoadBalancerCommand,
	DescribeListenersCommand,
	type Tag,
	type SubnetMapping,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { z } from "zod";

class LoadBalancerService {
	/**
	 * AWS Load Balancer management tool
	 * Provides comprehensive management capabilities for AWS Elastic Load Balancers within a specified AWS region
	 */

	toolName = "aws-lb-manager";
	description = "AWS Load Balancer management tool for ELB";

	listLoadBalancersInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		typeFilter: z
			.enum(["application", "network", "gateway"])
			.optional()
			.describe("Filter by Load Balancer type"),
		nameFilter: z
			.string()
			.optional()
			.describe("Filter based on a substring match in the Load Balancer name"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Output format (text, json, or table)"),
	};

	describeLoadBalancerInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		loadBalancerIdentifier: z
			.string()
			.describe("Load Balancer ARN or name to describe"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Output format (text, json, or table)"),
	};

	createLoadBalancerInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		name: z.string().describe("Name of the new Load Balancer"),
		type: z
			.enum(["application", "network", "gateway"])
			.describe("Type of Load Balancer to create"),
		scheme: z
			.enum(["internet-facing", "internal"])
			.optional()
			.default("internet-facing")
			.describe("Whether the Load Balancer is internet-facing or internal"),
		securityGroups: z
			.array(z.string())
			.optional()
			.describe("Security group IDs to associate with the Load Balancer"),
		subnetMappings: z
			.string()
			.describe(
				"Comma-separated list of subnet IDs and optionally their availability zones",
			),
		ipAddressType: z
			.enum(["ipv4", "dualstack"])
			.optional()
			.default("ipv4")
			.describe("IP address type (ipv4 or dualstack)"),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe("Tags to assign to the new Load Balancer"),
	};

	createListenerInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		loadBalancerIdentifier: z
			.string()
			.describe("Load Balancer ARN or name to add the listener to"),
		protocol: z
			.enum(["HTTP", "HTTPS", "TCP", "TLS", "UDP", "TCP_UDP"])
			.describe("Protocol for connections from clients to the Load Balancer"),
		port: z
			.number()
			.int()
			.min(1)
			.max(65535)
			.describe("Port on which the Load Balancer listens for incoming traffic"),
		defaultActions: z
			.string()
			.describe(
				"JSON string defining the action to take when a client connects to the listener",
			),
		sslPolicy: z
			.string()
			.optional()
			.describe(
				"Security policy to apply to the listener (for HTTPS/TLS listeners)",
			),
		certificateArns: z
			.string()
			.optional()
			.describe(
				"Comma-separated list of SSL certificate ARNs to associate with the listener",
			),
	};

	deleteListenerInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		listenerArn: z.string().describe("ARN of the listener to delete"),
	};

	deleteLoadBalancerInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		loadBalancerIdentifier: z
			.string()
			.describe("Load Balancer ARN or name to delete"),
		force: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"If true, bypasses confirmation and immediately deletes the Load Balancer",
			),
	};

	listLoadBalancersZodInput = z.object(this.listLoadBalancersInput);
	describeLoadBalancerZodInput = z.object(this.describeLoadBalancerInput);
	createLoadBalancerZodInput = z.object(this.createLoadBalancerInput);
	createListenerZodInput = z.object(this.createListenerInput);
	deleteListenerZodInput = z.object(this.deleteListenerInput);
	deleteLoadBalancerZodInput = z.object(this.deleteLoadBalancerInput);

	/**
	 * Resolves a Load Balancer identifier (ARN or name) to an ARN
	 * @param client The ELBv2 client
	 * @param identifier The Load Balancer identifier (ARN or name)
	 * @returns Promise containing the Load Balancer ARN
	 */
	private async resolveLoadBalancerIdentifier(
		client: ElasticLoadBalancingV2Client,
		identifier: string,
	): Promise<string> {
		// If the identifier is already an ARN, return it directly
		if (identifier.startsWith("arn:aws:elasticloadbalancing:")) {
			return identifier;
		}

		// Otherwise, try to find the Load Balancer by name
		const command = new DescribeLoadBalancersCommand({
			Names: [identifier],
		});

		try {
			const response = await client.send(command);
			if (
				!response.LoadBalancers ||
				response.LoadBalancers.length === 0 ||
				!response.LoadBalancers[0].LoadBalancerArn
			) {
				throw new Error(`Load Balancer with name ${identifier} not found`);
			}
			return response.LoadBalancers[0].LoadBalancerArn;
		} catch (error) {
			throw new Error(`Unable to resolve Load Balancer identifier: ${error}`);
		}
	}

	/**
	 * Lists Load Balancers in the specified AWS region
	 */
	async listLoadBalancers({
		region,
		typeFilter,
		nameFilter,
		outputFormat = "text",
	}: {
		region: string;
		typeFilter?: "application" | "network" | "gateway";
		nameFilter?: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });
			const command = new DescribeLoadBalancersCommand({});

			const response = await client.send(command);

			if (!response.LoadBalancers) {
				return { loadBalancers: [] };
			}

			// Filter Load Balancers if necessary
			let filteredLBs = response.LoadBalancers;

			if (typeFilter) {
				filteredLBs = filteredLBs.filter((lb) => lb.Type === typeFilter);
			}

			if (nameFilter) {
				filteredLBs = filteredLBs.filter(
					(lb) =>
						lb.LoadBalancerName &&
						lb.LoadBalancerName.toLowerCase().includes(
							nameFilter.toLowerCase(),
						),
				);
			}

			// Format the results
			const formattedLBs = filteredLBs.map((lb) => ({
				name: lb.LoadBalancerName,
				arn: lb.LoadBalancerArn,
				dnsName: lb.DNSName,
				type: lb.Type,
				scheme: lb.Scheme,
				vpcId: lb.VpcId,
				state: lb.State?.Code,
				createdTime: lb.CreatedTime,
				ipAddressType: lb.IpAddressType,
			}));

			return { loadBalancers: formattedLBs };
		} catch (error) {
			console.error("Error listing Load Balancers:", error);
			throw error;
		}
	}

	/**
	 * Describes a specific Load Balancer
	 */
	async describeLoadBalancer({
		region,
		loadBalancerIdentifier,
		outputFormat = "text",
	}: {
		region: string;
		loadBalancerIdentifier: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Try to determine if the identifier is an ARN or a name
			let loadBalancerArn: string;

			if (loadBalancerIdentifier.startsWith("arn:aws:elasticloadbalancing:")) {
				loadBalancerArn = loadBalancerIdentifier;
			} else {
				// Try to find the Load Balancer by name
				loadBalancerArn = await this.resolveLoadBalancerIdentifier(
					client,
					loadBalancerIdentifier,
				);
			}

			// Get the Load Balancer details
			const lbCommand = new DescribeLoadBalancersCommand({
				LoadBalancerArns: [loadBalancerArn],
			});

			const lbResponse = await client.send(lbCommand);

			if (!lbResponse.LoadBalancers || lbResponse.LoadBalancers.length === 0) {
				throw new Error(`Load Balancer ${loadBalancerIdentifier} not found`);
			}

			const loadBalancer = lbResponse.LoadBalancers[0];

			// Get the listener information
			const listenerCommand = new DescribeListenersCommand({
				LoadBalancerArn: loadBalancerArn,
			});

			const listenerResponse = await client.send(listenerCommand);

			// Format the response
			return {
				details: {
					name: loadBalancer.LoadBalancerName,
					arn: loadBalancer.LoadBalancerArn,
					dnsName: loadBalancer.DNSName,
					type: loadBalancer.Type,
					scheme: loadBalancer.Scheme,
					vpcId: loadBalancer.VpcId,
					state: loadBalancer.State?.Code,
					createdTime: loadBalancer.CreatedTime,
					availabilityZones: loadBalancer.AvailabilityZones,
					securityGroups: loadBalancer.SecurityGroups,
					ipAddressType: loadBalancer.IpAddressType,
				},
				listeners:
					listenerResponse.Listeners?.map((listener) => ({
						arn: listener.ListenerArn,
						port: listener.Port,
						protocol: listener.Protocol,
						sslPolicy: listener.SslPolicy,
						certificates: listener.Certificates,
						defaultActions: listener.DefaultActions,
					})) || [],
			};
		} catch (error) {
			console.error("Error describing Load Balancer:", error);
			throw error;
		}
	}

	/**
	 * Creates a new Load Balancer
	 */
	async createLoadBalancer({
		region,
		name,
		type,
		scheme = "internet-facing",
		securityGroups,
		subnetMappings,
		ipAddressType = "ipv4",
		tags,
	}: {
		region: string;
		name: string;
		type: "application" | "network" | "gateway";
		scheme?: "internet-facing" | "internal";
		securityGroups?: string[];
		subnetMappings: string;
		ipAddressType?: "ipv4" | "dualstack";
		tags?: { Key: string; Value: string }[];
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Parse subnet mappings
			const parsedSubnetMappings: SubnetMapping[] = [];
			const subnetMappingsList = subnetMappings
				.split(",")
				.map((mapping) => mapping.trim());

			for (const mapping of subnetMappingsList) {
				const parts = mapping.split("=");
				if (parts.length === 1) {
					// Just a subnet ID
					parsedSubnetMappings.push({
						SubnetId: parts[0],
					});
				} else if (parts.length === 2) {
					// Subnet ID with AZ
					parsedSubnetMappings.push({
						SubnetId: parts[0],
						AllocationId: parts[1],
					});
				}
			}

			// Gateway Load Balancers don't support scheme
			const effectiveScheme = type === "gateway" ? undefined : scheme;

			// Create command
			const command = new CreateLoadBalancerCommand({
				Name: name,
				Type: type,
				Scheme: effectiveScheme,
				SecurityGroups:
					type === "application" || type === "network"
						? securityGroups
						: undefined,
				SubnetMappings:
					parsedSubnetMappings.length > 0 ? parsedSubnetMappings : undefined,
				IpAddressType: ipAddressType,
				Tags: tags as Tag[],
			});

			const response = await client.send(command);

			if (!response.LoadBalancers || response.LoadBalancers.length === 0) {
				throw new Error("Failed to create Load Balancer");
			}

			const loadBalancer = response.LoadBalancers[0];

			return {
				name: loadBalancer.LoadBalancerName,
				arn: loadBalancer.LoadBalancerArn,
				dnsName: loadBalancer.DNSName,
				type: loadBalancer.Type,
				scheme: loadBalancer.Scheme,
				vpcId: loadBalancer.VpcId,
			};
		} catch (error) {
			console.error("Error creating Load Balancer:", error);
			throw error;
		}
	}

	/**
	 * Creates a new listener for a specified Load Balancer
	 */
	async createListener({
		region,
		loadBalancerIdentifier,
		protocol,
		port,
		defaultActions,
		sslPolicy,
		certificateArns,
	}: {
		region: string;
		loadBalancerIdentifier: string;
		protocol: "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP" | "TCP_UDP";
		port: number;
		defaultActions: string;
		sslPolicy?: string;
		certificateArns?: string;
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Resolve the Load Balancer ARN
			const loadBalancerArn = await this.resolveLoadBalancerIdentifier(
				client,
				loadBalancerIdentifier,
			);

			// Parse the default actions JSON
			let parsedDefaultActions;
			try {
				parsedDefaultActions = JSON.parse(defaultActions);
			} catch (e) {
				throw new Error(`Failed to parse defaultActions JSON: ${e}`);
			}

			// Parse certificate ARNs if provided
			const certificates = certificateArns
				? certificateArns
						.split(",")
						.map((arn) => ({ CertificateArn: arn.trim() }))
				: undefined;

			// Create the listener
			const command = new CreateListenerCommand({
				LoadBalancerArn: loadBalancerArn,
				Protocol: protocol,
				Port: port,
				DefaultActions: parsedDefaultActions,
				SslPolicy:
					protocol === "HTTPS" || protocol === "TLS" ? sslPolicy : undefined,
				Certificates:
					protocol === "HTTPS" || protocol === "TLS" ? certificates : undefined,
			});

			const response = await client.send(command);

			if (!response.Listeners || response.Listeners.length === 0) {
				throw new Error("Failed to create listener");
			}

			const listener = response.Listeners[0];

			return {
				arn: listener.ListenerArn,
				port: listener.Port,
				protocol: listener.Protocol,
				loadBalancerArn: loadBalancerArn,
			};
		} catch (error) {
			console.error("Error creating listener:", error);
			throw error;
		}
	}

	/**
	 * Deletes a specified listener from a Load Balancer
	 */
	async deleteListener({
		region,
		listenerArn,
	}: {
		region: string;
		listenerArn: string;
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Delete the listener
			const command = new DeleteListenerCommand({
				ListenerArn: listenerArn,
			});

			await client.send(command);

			return {
				message: `Successfully deleted listener ${listenerArn}`,
				listenerArn,
			};
		} catch (error) {
			console.error("Error deleting listener:", error);
			throw error;
		}
	}

	/**
	 * Deletes a specified Load Balancer
	 */
	async deleteLoadBalancer({
		region,
		loadBalancerIdentifier,
		force = false,
	}: {
		region: string;
		loadBalancerIdentifier: string;
		force?: boolean;
	}) {
		try {
			const client = new ElasticLoadBalancingV2Client({ region });

			// Resolve the Load Balancer ARN
			const loadBalancerArn = await this.resolveLoadBalancerIdentifier(
				client,
				loadBalancerIdentifier,
			);

			// Delete the Load Balancer
			const command = new DeleteLoadBalancerCommand({
				LoadBalancerArn: loadBalancerArn,
			});

			await client.send(command);

			return {
				message: `Successfully deleted Load Balancer ${loadBalancerIdentifier}`,
				loadBalancerArn,
			};
		} catch (error) {
			console.error("Error deleting Load Balancer:", error);
			throw error;
		}
	}
}

export default new LoadBalancerService();
