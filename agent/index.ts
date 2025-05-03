import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";

import { tool } from "@langchain/core/tools";
import type { z } from "zod";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Import tools array instead of individual services
import tools from "../tools";

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

// Create LangChain tools from the tools array
const langchainTools = tools.map((toolService) =>
	tool(
		async (input: Record<string, unknown>) => {
			try {
				const result = await toolService.execute(input);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error executing ${toolService.toolName}: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
		{
			name: toolService.toolName,
			description: toolService.description,
			schema: toolService.zodSchema,
		},
	),
);

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
			tools: langchainTools,
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
