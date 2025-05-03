import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import tools from "tools";

const toolObject: Record<string, any> = {};

const server = new McpServer({
	name: "aws-devops",
	version: "1.0.0",
	capabilities: {
		resources: {},
		tools: {},
	},
});

// EC2 Tools
server.tool(
	getInstancesService.toolName,
	getInstancesService.description,
	getInstancesService.getInstancesInput,
	async ({
		region,
		filters = [],
		nameFilter,
		includeStoppedInstances = false,
	}) => {
		try {
			const instances = await getInstancesService.getInstances({
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
	launchInstanceService.toolName,
	launchInstanceService.description,
	launchInstanceService.launchInstanceInput,
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
			const instance = await launchInstanceService.launchInstance({
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

// RDS Tool Registrations
server.tool(
	listDbInstancesService.toolName,
	listDbInstancesService.description,
	listDbInstancesService.listDbInstancesInput,
	async ({ region, outputFormat = "text" }) => {
		try {
			const result = await listDbInstancesService.listDbInstances({
				region,
				outputFormat,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error("Error listing RDS DB instances:", error);
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
	describeDbInstanceService.toolName,
	describeDbInstanceService.description,
	describeDbInstanceService.describeDbInstanceInput,
	async ({ region, dbInstanceIdentifier, outputFormat = "text" }) => {
		try {
			const result = await describeDbInstanceService.describeDbInstance({
				region,
				dbInstanceIdentifier,
				outputFormat,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(
				`Error describing RDS DB instance ${dbInstanceIdentifier}:`,
				error,
			);
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
	createDbInstanceService.toolName,
	createDbInstanceService.description,
	createDbInstanceService.createDbInstanceInput,
	async (params) => {
		try {
			const result = await createDbInstanceService.createDbInstance(params);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(`Error creating RDS DB instance:`, error);
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
	deleteDbInstanceService.toolName,
	deleteDbInstanceService.description,
	deleteDbInstanceService.deleteDbInstanceInput,
	async ({
		region,
		dbInstanceIdentifier,
		finalDbSnapshotIdentifier,
		skipFinalSnapshot = false,
	}) => {
		try {
			const result = await deleteDbInstanceService.deleteDbInstance({
				region,
				dbInstanceIdentifier,
				finalDbSnapshotIdentifier,
				skipFinalSnapshot,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(
				`Error deleting RDS DB instance ${dbInstanceIdentifier}:`,
				error,
			);
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
	listDbClustersService.toolName,
	listDbClustersService.description,
	listDbClustersService.listDbClustersInput,
	async ({ region, outputFormat = "text" }) => {
		try {
			const result = await listDbClustersService.listDbClusters({
				region,
				outputFormat,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error("Error listing RDS DB clusters:", error);
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
	describeDbClusterService.toolName,
	describeDbClusterService.description,
	describeDbClusterService.describeDbClusterInput,
	async ({ region, dbClusterIdentifier, outputFormat = "text" }) => {
		try {
			const result = await describeDbClusterService.describeDbCluster({
				region,
				dbClusterIdentifier,
				outputFormat,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(
				`Error describing RDS DB cluster ${dbClusterIdentifier}:`,
				error,
			);
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
	createDbClusterService.toolName,
	createDbClusterService.description,
	createDbClusterService.createDbClusterInput,
	async (params) => {
		try {
			const result = await createDbClusterService.createDbCluster(params);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(`Error creating RDS DB cluster:`, error);
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
	deleteDbClusterService.toolName,
	deleteDbClusterService.description,
	deleteDbClusterService.deleteDbClusterInput,
	async ({
		region,
		dbClusterIdentifier,
		finalDbClusterSnapshotIdentifier,
		skipFinalSnapshot = false,
	}) => {
		try {
			const result = await deleteDbClusterService.deleteDbCluster({
				region,
				dbClusterIdentifier,
				finalDbClusterSnapshotIdentifier,
				skipFinalSnapshot,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(
				`Error deleting RDS DB cluster ${dbClusterIdentifier}:`,
				error,
			);
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
	createDbClusterSnapshotService.toolName,
	createDbClusterSnapshotService.description,
	createDbClusterSnapshotService.createDbClusterSnapshotInput,
	async ({ region, dbClusterIdentifier, dbClusterSnapshotIdentifier }) => {
		try {
			const result =
				await createDbClusterSnapshotService.createDbClusterSnapshot({
					region,
					dbClusterIdentifier,
					dbClusterSnapshotIdentifier,
				});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(
				`Error creating RDS DB cluster snapshot for ${dbClusterIdentifier}:`,
				error,
			);
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
	restoreDbClusterFromSnapshotService.toolName,
	restoreDbClusterFromSnapshotService.description,
	restoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshotInput,
	async ({
		region,
		dbClusterIdentifier,
		dbClusterSnapshotIdentifier,
		vpcSecurityGroupIds,
		dbSubnetGroupName,
		port,
	}) => {
		try {
			const result =
				await restoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshot({
					region,
					dbClusterIdentifier,
					dbClusterSnapshotIdentifier,
					vpcSecurityGroupIds,
					dbSubnetGroupName,
					port,
				});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(
				`Error restoring RDS DB cluster from snapshot ${dbClusterSnapshotIdentifier}:`,
				error,
			);
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
	createDbSnapshotService.toolName,
	createDbSnapshotService.description,
	createDbSnapshotService.createDbSnapshotInput,
	async ({ region, dbInstanceIdentifier, dbSnapshotIdentifier, tags }) => {
		try {
			const result = await createDbSnapshotService.createDbSnapshot({
				region,
				dbInstanceIdentifier,
				dbSnapshotIdentifier,
				tags,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(
				`Error creating RDS DB snapshot for ${dbInstanceIdentifier}:`,
				error,
			);
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
	restoreDbInstanceFromDbSnapshotService.toolName,
	restoreDbInstanceFromDbSnapshotService.description,
	restoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshotInput,
	async (params) => {
		try {
			const result =
				await restoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshot(
					params,
				);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
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

// Add ElastiCache Tool Registrations
server.tool(
	describeCacheClustersService.toolName,
	describeCacheClustersService.description,
	describeCacheClustersService.describeCacheClustersInput,
	async ({
		region,
		cacheClusterId,
		showCacheNodeInfo = false,
		outputFormat,
	}) => {
		try {
			const result = await describeCacheClustersService.describeCacheClusters({
				region,
				cacheClusterId,
				showCacheNodeInfo,
				outputFormat,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error("Error describing ElastiCache clusters:", error);
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
	createCacheClusterService.toolName,
	createCacheClusterService.description,
	createCacheClusterService.createCacheClusterInput,
	async (params) => {
		try {
			const result = await createCacheClusterService.createCacheCluster(params);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(`Error creating ElastiCache cluster:`, error);
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
	deleteCacheClusterService.toolName,
	deleteCacheClusterService.description,
	deleteCacheClusterService.deleteCacheClusterInput,
	async ({ region, cacheClusterId, finalSnapshotIdentifier }) => {
		try {
			const result = await deleteCacheClusterService.deleteCacheCluster({
				region,
				cacheClusterId,
				finalSnapshotIdentifier,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error(
				`Error deleting ElastiCache cluster ${cacheClusterId}:`,
				error,
			);
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

// Route53 tools
server.tool(
	listHostedZonesService.toolName,
	listHostedZonesService.description,
	listHostedZonesService.listHostedZonesInput,
	async ({ outputFormat }) => {
		try {
			const result = await listHostedZonesService.listHostedZones({
				outputFormat,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error("Error listing Route53 hosted zones:", error);
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

// S3 tools
server.tool(
	listBucketsService.toolName,
	listBucketsService.description,
	listBucketsService.listBucketsInput,
	async ({ outputFormat }) => {
		try {
			const result = await listBucketsService.listBuckets({
				outputFormat,
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			console.error("Error listing S3 buckets:", error);
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

// Add SQS tools, continue with other services...

// Continue adding tool registrations for all remaining services...

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
