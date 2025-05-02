import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import GetInstancesService from "tools/service/EC2/getInstances.service";
import LaunchInstanceService from "tools/service/EC2/launchInstance.service";
// Import RDS Services
import ListDbInstancesService from "tools/service/RDS/listDbInstances.service";
import DescribeDbInstanceService from "tools/service/RDS/describeDbInstance.service";
import CreateDbInstanceService from "tools/service/RDS/createDbInstance.service";
import DeleteDbInstanceService from "tools/service/RDS/deleteDbInstance.service";
import ListDbClustersService from "tools/service/RDS/listDbClusters.service";
import DescribeDbClusterService from "tools/service/RDS/describeDbCluster.service";
import CreateDbClusterService from "tools/service/RDS/createDbCluster.service";
import DeleteDbClusterService from "tools/service/RDS/deleteDbCluster.service";
import CreateDbClusterSnapshotService from "tools/service/RDS/createDbClusterSnapshot.service";
import RestoreDbClusterFromSnapshotService from "tools/service/RDS/restoreDbClusterFromSnapshot.service";
import CreateDbSnapshotService from "tools/service/RDS/createDbSnapshot.service";
import RestoreDbInstanceFromDbSnapshotService from "tools/service/RDS/restoreDbInstanceFromDbSnapshot.service";

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
			// RDS Tools
			[ListDbInstancesService.toolName]: {
				description: ListDbInstancesService.description,
				parameters: ListDbInstancesService.listDbInstancesInput,
			},
			[DescribeDbInstanceService.toolName]: {
				description: DescribeDbInstanceService.description,
				parameters: DescribeDbInstanceService.describeDbInstanceInput,
			},
			[CreateDbInstanceService.toolName]: {
				description: CreateDbInstanceService.description,
				parameters: CreateDbInstanceService.createDbInstanceInput,
			},
			[DeleteDbInstanceService.toolName]: {
				description: DeleteDbInstanceService.description,
				parameters: DeleteDbInstanceService.deleteDbInstanceInput,
			},
			[ListDbClustersService.toolName]: {
				description: ListDbClustersService.description,
				parameters: ListDbClustersService.listDbClustersInput,
			},
			[DescribeDbClusterService.toolName]: {
				description: DescribeDbClusterService.description,
				parameters: DescribeDbClusterService.describeDbClusterInput,
			},
			[CreateDbClusterService.toolName]: {
				description: CreateDbClusterService.description,
				parameters: CreateDbClusterService.createDbClusterInput,
			},
			[DeleteDbClusterService.toolName]: {
				description: DeleteDbClusterService.description,
				parameters: DeleteDbClusterService.deleteDbClusterInput,
			},
			[CreateDbClusterSnapshotService.toolName]: {
				description: CreateDbClusterSnapshotService.description,
				parameters: CreateDbClusterSnapshotService.createDbClusterSnapshotInput,
			},
			[RestoreDbClusterFromSnapshotService.toolName]: {
				description: RestoreDbClusterFromSnapshotService.description,
				parameters:
					RestoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshotInput,
			},
			[CreateDbSnapshotService.toolName]: {
				description: CreateDbSnapshotService.description,
				parameters: CreateDbSnapshotService.createDbSnapshotInput,
			},
			[RestoreDbInstanceFromDbSnapshotService.toolName]: {
				description: RestoreDbInstanceFromDbSnapshotService.description,
				parameters:
					RestoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshotInput,
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

// Add RDS Tool Registrations
server.tool(
	"list-db-instances",
	"Retrieves and displays a detailed list of RDS DB instances",
	ListDbInstancesService.listDbInstancesInput,
	async ({ region, outputFormat = "text" }) => {
		try {
			const result = await ListDbInstancesService.listDbInstances({
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
	"describe-db-instance",
	"Displays detailed information about a specific RDS DB instance",
	DescribeDbInstanceService.describeDbInstanceInput,
	async ({ region, dbInstanceIdentifier, outputFormat = "text" }) => {
		try {
			const result = await DescribeDbInstanceService.describeDbInstance({
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
	"create-db-instance",
	"Creates a new RDS DB instance with specified configurations",
	CreateDbInstanceService.createDbInstanceInput,
	async (params) => {
		try {
			const result = await CreateDbInstanceService.createDbInstance(params);

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
	"delete-db-instance",
	"Deletes a specified RDS DB instance",
	DeleteDbInstanceService.deleteDbInstanceInput,
	async ({
		region,
		dbInstanceIdentifier,
		finalDbSnapshotIdentifier,
		skipFinalSnapshot = false,
	}) => {
		try {
			const result = await DeleteDbInstanceService.deleteDbInstance({
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
	"list-db-clusters",
	"Retrieves and displays a detailed list of RDS DB clusters (Aurora)",
	ListDbClustersService.listDbClustersInput,
	async ({ region, outputFormat = "text" }) => {
		try {
			const result = await ListDbClustersService.listDbClusters({
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
	"describe-db-cluster",
	"Displays detailed information about a specific RDS DB cluster (Aurora)",
	DescribeDbClusterService.describeDbClusterInput,
	async ({ region, dbClusterIdentifier, outputFormat = "text" }) => {
		try {
			const result = await DescribeDbClusterService.describeDbCluster({
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
	"create-db-cluster",
	"Creates a new RDS DB cluster (Aurora) with specified configurations",
	CreateDbClusterService.createDbClusterInput,
	async (params) => {
		try {
			const result = await CreateDbClusterService.createDbCluster(params);

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
	"delete-db-cluster",
	"Deletes a specified RDS DB cluster (Aurora)",
	DeleteDbClusterService.deleteDbClusterInput,
	async ({
		region,
		dbClusterIdentifier,
		finalDbClusterSnapshotIdentifier,
		skipFinalSnapshot = false,
	}) => {
		try {
			const result = await DeleteDbClusterService.deleteDbCluster({
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
	"create-db-cluster-snapshot",
	"Creates a snapshot of a specified RDS DB cluster (Aurora)",
	CreateDbClusterSnapshotService.createDbClusterSnapshotInput,
	async ({ region, dbClusterIdentifier, dbClusterSnapshotIdentifier }) => {
		try {
			const result =
				await CreateDbClusterSnapshotService.createDbClusterSnapshot({
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
	"restore-db-cluster-from-snapshot",
	"Restores an RDS DB cluster (Aurora) from a snapshot",
	RestoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshotInput,
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
				await RestoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshot({
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
	"create-db-snapshot",
	"Creates a snapshot of a specified RDS DB instance",
	CreateDbSnapshotService.createDbSnapshotInput,
	async ({ region, dbInstanceIdentifier, dbSnapshotIdentifier, tags }) => {
		try {
			const result = await CreateDbSnapshotService.createDbSnapshot({
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
	"restore-db-instance-from-db-snapshot",
	"Restores an RDS DB instance from a snapshot",
	RestoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshotInput,
	async (params) => {
		try {
			const result =
				await RestoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshot(
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
			console.error(`Error restoring RDS DB instance from snapshot:`, error);
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
