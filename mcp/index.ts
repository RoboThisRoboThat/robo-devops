import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import GetInstancesService from "tools/service/EC2/getInstances.service";
import LaunchInstanceService from "tools/service/EC2/launchInstance.service";

const server = new McpServer({
	name: "aws-devops",
	version: "1.0.0",
	capabilities: {
		resources: {},
		tools: {
			[GetInstancesService.toolName]: {
				description: GetInstancesService.description,
				parameters: GetInstancesService.getInstancesInput,
			},
			[LaunchInstanceService.toolName]: {
				description: LaunchInstanceService.description,
				parameters: LaunchInstanceService.launchInstanceInput,
			},
		},
	},
});
server.tool(
	"get-ec2-instances",
	"Get EC2 instances from a specific AWS region with flexible filtering options",
	GetInstancesService.getInstancesInput,
	async ({
		region,
		filters = [],
		nameFilter,
		includeStoppedInstances = false,
	}) => {
		try {
			const instances = await GetInstancesService.getInstances({
				region,
				filters,
				nameFilter,
				includeStoppedInstances,
			});

			if (instances.length === 0) {
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({ instances: [] }),
						},
					],
				};
			}

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ instances }),
					},
				],
			};
		} catch (error) {
			console.error("Error getting EC2 instances:", error);
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({
							error: error instanceof Error ? error.message : String(error),
						}),
					},
				],
			};
		}
	},
);
server.tool(
	"launch-ec2-instance",
	"Launch a new EC2 instance in a specific AWS region with smart defaults",
	LaunchInstanceService.launchInstanceInput,
	async ({
		region,
		imageId,
		instanceType,
		keyName,
		securityGroupIds = [],
		subnetId,
		tags = [],
		createDefaultSecurityGroup = true,
	}) => {
		try {
			const instance = await LaunchInstanceService.launchInstance({
				region,
				imageId,
				instanceType,
				keyName,
				securityGroupIds,
				subnetId,
				tags,
				createDefaultSecurityGroup,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ instance }),
					},
				],
			};
		} catch (error) {
			console.error("Error launching EC2 instance:", error);
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({
							error: error instanceof Error ? error.message : String(error),
						}),
					},
				],
			};
		}
	},
);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
