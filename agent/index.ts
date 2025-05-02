import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
// EC2 Services
import GetInstancesService from "tools/service/EC2/getInstances.service";
import LaunchInstanceService from "tools/service/EC2/launchInstance.service";
// RDS Services
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

import { tool } from "@langchain/core/tools";
import type { z } from "zod";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Initialize our tools

// Create structured tools for the ReAct agent
// EC2 Tools
const getEC2Instances = tool(
	async (input: z.infer<typeof GetInstancesService.getInstancesZodInput>) => {
		try {
			const instances = await GetInstancesService.getInstances({
				region: input.region,
				filters: input.filters || [],
				nameFilter: input.nameFilter || "",
				includeStoppedInstances: input.includeStoppedInstances || false,
			});
			return JSON.stringify(instances, null, 2);
		} catch (error) {
			return `Error retrieving EC2 instances: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: GetInstancesService.toolName,
		description: GetInstancesService.description,
		schema: GetInstancesService.getInstancesZodInput,
	},
);

const launchEC2Instance = tool(
	async (
		input: z.infer<typeof LaunchInstanceService.launchInstanceZodInput>,
	) => {
		try {
			const instance = await LaunchInstanceService.launchInstance({
				...input,
			});
			return JSON.stringify(instance, null, 2);
		} catch (error) {
			return `Error launching EC2 instance: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: LaunchInstanceService.toolName,
		description: LaunchInstanceService.description,
		schema: LaunchInstanceService.launchInstanceZodInput,
	},
);

// RDS Tools
const listDbInstances = tool(
	async (
		input: z.infer<typeof ListDbInstancesService.listDbInstancesZodInput>,
	) => {
		try {
			const result = await ListDbInstancesService.listDbInstances({
				region: input.region,
				outputFormat: input.outputFormat || "text",
			});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error listing RDS DB instances: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: ListDbInstancesService.toolName,
		description: ListDbInstancesService.description,
		schema: ListDbInstancesService.listDbInstancesZodInput,
	},
);

const describeDbInstance = tool(
	async (
		input: z.infer<typeof DescribeDbInstanceService.describeDbInstanceZodInput>,
	) => {
		try {
			const result = await DescribeDbInstanceService.describeDbInstance({
				region: input.region,
				dbInstanceIdentifier: input.dbInstanceIdentifier,
				outputFormat: input.outputFormat || "text",
			});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error describing RDS DB instance: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: DescribeDbInstanceService.toolName,
		description: DescribeDbInstanceService.description,
		schema: DescribeDbInstanceService.describeDbInstanceZodInput,
	},
);

const createDbInstance = tool(
	async (
		input: z.infer<typeof CreateDbInstanceService.createDbInstanceZodInput>,
	) => {
		try {
			const result = await CreateDbInstanceService.createDbInstance(input);
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error creating RDS DB instance: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: CreateDbInstanceService.toolName,
		description: CreateDbInstanceService.description,
		schema: CreateDbInstanceService.createDbInstanceZodInput,
	},
);

const deleteDbInstance = tool(
	async (
		input: z.infer<typeof DeleteDbInstanceService.deleteDbInstanceZodInput>,
	) => {
		try {
			const result = await DeleteDbInstanceService.deleteDbInstance({
				region: input.region,
				dbInstanceIdentifier: input.dbInstanceIdentifier,
				finalDbSnapshotIdentifier: input.finalDbSnapshotIdentifier,
				skipFinalSnapshot: input.skipFinalSnapshot || false,
			});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error deleting RDS DB instance: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: DeleteDbInstanceService.toolName,
		description: DeleteDbInstanceService.description,
		schema: DeleteDbInstanceService.deleteDbInstanceZodInput,
	},
);

const listDbClusters = tool(
	async (
		input: z.infer<typeof ListDbClustersService.listDbClustersZodInput>,
	) => {
		try {
			const result = await ListDbClustersService.listDbClusters({
				region: input.region,
				outputFormat: input.outputFormat || "text",
			});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error listing RDS DB clusters: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: ListDbClustersService.toolName,
		description: ListDbClustersService.description,
		schema: ListDbClustersService.listDbClustersZodInput,
	},
);

const describeDbCluster = tool(
	async (
		input: z.infer<typeof DescribeDbClusterService.describeDbClusterZodInput>,
	) => {
		try {
			const result = await DescribeDbClusterService.describeDbCluster({
				region: input.region,
				dbClusterIdentifier: input.dbClusterIdentifier,
				outputFormat: input.outputFormat || "text",
			});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error describing RDS DB cluster: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: DescribeDbClusterService.toolName,
		description: DescribeDbClusterService.description,
		schema: DescribeDbClusterService.describeDbClusterZodInput,
	},
);

const createDbCluster = tool(
	async (
		input: z.infer<typeof CreateDbClusterService.createDbClusterZodInput>,
	) => {
		try {
			const result = await CreateDbClusterService.createDbCluster(input);
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error creating RDS DB cluster: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: CreateDbClusterService.toolName,
		description: CreateDbClusterService.description,
		schema: CreateDbClusterService.createDbClusterZodInput,
	},
);

const deleteDbCluster = tool(
	async (
		input: z.infer<typeof DeleteDbClusterService.deleteDbClusterZodInput>,
	) => {
		try {
			const result = await DeleteDbClusterService.deleteDbCluster({
				region: input.region,
				dbClusterIdentifier: input.dbClusterIdentifier,
				finalDbClusterSnapshotIdentifier:
					input.finalDbClusterSnapshotIdentifier,
				skipFinalSnapshot: input.skipFinalSnapshot || false,
			});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error deleting RDS DB cluster: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: DeleteDbClusterService.toolName,
		description: DeleteDbClusterService.description,
		schema: DeleteDbClusterService.deleteDbClusterZodInput,
	},
);

const createDbClusterSnapshot = tool(
	async (
		input: z.infer<
			typeof CreateDbClusterSnapshotService.createDbClusterSnapshotZodInput
		>,
	) => {
		try {
			const result =
				await CreateDbClusterSnapshotService.createDbClusterSnapshot({
					region: input.region,
					dbClusterIdentifier: input.dbClusterIdentifier,
					dbClusterSnapshotIdentifier: input.dbClusterSnapshotIdentifier,
				});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error creating RDS DB cluster snapshot: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: CreateDbClusterSnapshotService.toolName,
		description: CreateDbClusterSnapshotService.description,
		schema: CreateDbClusterSnapshotService.createDbClusterSnapshotZodInput,
	},
);

const restoreDbClusterFromSnapshot = tool(
	async (
		input: z.infer<
			typeof RestoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshotZodInput
		>,
	) => {
		try {
			const result =
				await RestoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshot({
					region: input.region,
					dbClusterIdentifier: input.dbClusterIdentifier,
					dbClusterSnapshotIdentifier: input.dbClusterSnapshotIdentifier,
					vpcSecurityGroupIds: input.vpcSecurityGroupIds,
					dbSubnetGroupName: input.dbSubnetGroupName,
					port: input.port,
				});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error restoring RDS DB cluster from snapshot: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: RestoreDbClusterFromSnapshotService.toolName,
		description: RestoreDbClusterFromSnapshotService.description,
		schema:
			RestoreDbClusterFromSnapshotService.restoreDbClusterFromSnapshotZodInput,
	},
);

const createDbSnapshot = tool(
	async (
		input: z.infer<typeof CreateDbSnapshotService.createDbSnapshotZodInput>,
	) => {
		try {
			const result = await CreateDbSnapshotService.createDbSnapshot({
				region: input.region,
				dbInstanceIdentifier: input.dbInstanceIdentifier,
				dbSnapshotIdentifier: input.dbSnapshotIdentifier,
				tags: input.tags,
			});
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error creating RDS DB snapshot: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: CreateDbSnapshotService.toolName,
		description: CreateDbSnapshotService.description,
		schema: CreateDbSnapshotService.createDbSnapshotZodInput,
	},
);

const restoreDbInstanceFromDbSnapshot = tool(
	async (
		input: z.infer<
			typeof RestoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshotZodInput
		>,
	) => {
		try {
			const result =
				await RestoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshot(
					input,
				);
			return JSON.stringify(result, null, 2);
		} catch (error) {
			return `Error restoring RDS DB instance from snapshot: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	{
		name: RestoreDbInstanceFromDbSnapshotService.toolName,
		description: RestoreDbInstanceFromDbSnapshotService.description,
		schema:
			RestoreDbInstanceFromDbSnapshotService.restoreDbInstanceFromDbSnapshotZodInput,
	},
);

// Message type for conversation
export interface Message {
	role: "user" | "assistant";
	content: string;
}

// Chat conversation type
export interface Conversation {
	id: string;
	title: string;
	messages: Message[];
	history: BaseMessage[];
}

export class DeploymentAgentService {
	private agent: ReturnType<typeof createReactAgent>;
	private conversations: Map<string, Conversation> = new Map();

	constructor() {
		// Initialize the OpenAI model
		const model = new ChatOpenAI({
			modelName: "gpt-4o",
			temperature: 0,
			openAIApiKey: process.env.OPENAI_API_KEY,
		});

		// Create the deployment agent using the ReAct agent from LangGraph.js
		const promptContent = readFileSync(
			resolve(__dirname, "./prompt.md"),
			"utf-8",
		);
		console.log("Loaded prompt with length:", promptContent.length);

		this.agent = createReactAgent({
			llm: model,
			tools: [
				// EC2 Tools
				getEC2Instances,
				launchEC2Instance,
				// RDS Tools
				listDbInstances,
				describeDbInstance,
				createDbInstance,
				deleteDbInstance,
				listDbClusters,
				describeDbCluster,
				createDbCluster,
				deleteDbCluster,
				createDbClusterSnapshot,
				restoreDbClusterFromSnapshot,
				createDbSnapshot,
				restoreDbInstanceFromDbSnapshot,
			],
			prompt: promptContent,
		});
	}

	// Create a new conversation
	createConversation(title = "New Conversation"): Conversation {
		const id = Date.now().toString();
		const conversation: Conversation = {
			id,
			title,
			messages: [],
			history: [],
		};
		this.conversations.set(id, conversation);
		return conversation;
	}

	// Get a conversation by ID
	getConversation(id: string): Conversation | undefined {
		return this.conversations.get(id);
	}

	// List all conversations
	listConversations(): Conversation[] {
		return Array.from(this.conversations.values());
	}

	// Delete a conversation
	deleteConversation(id: string): boolean {
		return this.conversations.delete(id);
	}

	// Send a message to a conversation and get a response
	async sendMessage(
		conversationId: string,
		message: string,
	): Promise<Message | null> {
		const conversation = this.conversations.get(conversationId);
		if (!conversation) {
			return null;
		}

		// Add user input to conversation
		const userMessage: Message = {
			role: "user",
			content: message,
		};
		conversation.messages.push(userMessage);

		// Add to LangChain history format
		conversation.history.push(new HumanMessage(message));

		try {
			// Invoke agent with entire conversation history
			const result = await this.agent.invoke({
				messages: conversation.history,
			});

			// Extract the final response
			const finalMessage = result.messages[result.messages.length - 1];
			const assistantMessage: Message = {
				role: "assistant",
				content: String(finalMessage.content),
			};

			// Add to conversation
			conversation.messages.push(assistantMessage);
			conversation.history.push(finalMessage);

			return assistantMessage;
		} catch (error) {
			console.error("Error processing request:", error);
			const errorMessage: Message = {
				role: "assistant",
				content: `Error processing your request: ${error instanceof Error ? error.message : String(error)}`,
			};
			conversation.messages.push(errorMessage);
			return errorMessage;
		}
	}
}

// Export a singleton instance
export const deploymentAgent = new DeploymentAgentService();

// CLI example (can be removed in production)
if (require.main === module) {
	import("node:readline").then(({ default: readline }) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		console.log("Deployment Agent is ready. Type your request:");
		const conversation = deploymentAgent.createConversation("CLI Conversation");

		rl.on("line", async (input: string) => {
			if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
				console.log("Exiting Deployment Agent");
				rl.close();
				process.exit(0);
			}

			try {
				const response = await deploymentAgent.sendMessage(
					conversation.id,
					input,
				);
				if (response) {
					console.log(`\nAgent: ${response.content}`);
				}
				console.log("\nWhat else would you like to do? (Type 'exit' to quit)");
			} catch (error) {
				console.error("Error:", error);
				console.log("\nWhat else would you like to do? (Type 'exit' to quit)");
			}
		});
	});
}
