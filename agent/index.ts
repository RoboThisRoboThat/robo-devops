import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import GetInstancesService from "tools/service/EC2/getInstances.service";
import LaunchInstanceService from "tools/service/EC2/launchInstance.service";
import { tool } from "@langchain/core/tools";
import type { z } from "zod";
import readline from "node:readline";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Initialize our tools

// Create structured tools for the ReAct agent
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

// Initialize the OpenAI model
const model = new ChatOpenAI({
	modelName: "gpt-4o",
	temperature: 0,
	openAIApiKey: process.env.OPENAI_API_KEY,
});

// Create the deployment agent using the ReAct agent from LangGraph.js
const promptContent = readFileSync(resolve(__dirname, "./prompt.md"), "utf-8");
console.log("Loaded prompt with length:", promptContent.length);
const deploymentAgent = createReactAgent({
	llm: model,
	tools: [getEC2Instances, launchEC2Instance],
	prompt: promptContent,
});

// Start the agent on user input
console.log("Deployment Agent is ready. Type your request:");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// Initialize conversation history with proper typing
const conversationHistory: BaseMessage[] = [];

rl.on("line", async (input: string) => {
	if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
		console.log("Exiting Deployment Agent");
		rl.close();
		process.exit(0);
	}

	try {
		// Add user input to conversation history
		conversationHistory.push(new HumanMessage(input));

		// Invoke agent with entire conversation history
		const result = await deploymentAgent.invoke({
			messages: conversationHistory,
		});

		// Extract and display the final response
		const finalMessage = result.messages[result.messages.length - 1];
		console.log(`\nAgent: ${finalMessage.content}`);

		// Add agent response to conversation history
		conversationHistory.push(finalMessage);

		console.log("\nWhat else would you like to do? (Type 'exit' to quit)");
	} catch (error) {
		console.error("Error processing your request:", error);
		console.log("\nWhat else would you like to do? (Type 'exit' to quit)");
	}
});
