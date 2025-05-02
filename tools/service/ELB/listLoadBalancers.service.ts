import {
	ElasticLoadBalancingV2Client,
	DescribeLoadBalancersCommand,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { z } from "zod";

class ListLoadBalancersService {
	/**
	 * Lists Load Balancers in the specified AWS region
	 */
	toolName = "list-load-balancers";
	description = "Retrieves and displays a detailed list of Load Balancers";

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
			.describe("Specifies the output format"),
	};

	listLoadBalancersZodInput = z.object(this.listLoadBalancersInput);

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
				filteredLBs = filteredLBs.filter((lb: any) => lb.Type === typeFilter);
			}

			if (nameFilter) {
				filteredLBs = filteredLBs.filter((lb: any) =>
					lb.LoadBalancerName?.toLowerCase().includes(nameFilter.toLowerCase()),
				);
			}

			// Format the results
			const formattedLBs = filteredLBs.map((lb: any) => ({
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
}

export default new ListLoadBalancersService();
