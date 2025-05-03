// Remove the import from database
import { v4 as uuidv4 } from "uuid";

// Types matching the agent
export interface Message {
	role: "user" | "assistant";
	content: string;
	id?: string;
	created_at?: string;
}

export interface Conversation {
	id: string;
	title: string;
	messages: Message[];
	created_at?: string;
}

// Function to get conversations from local storage
const getConversationsFromStorage = (): Conversation[] => {
	try {
		const data = localStorage.getItem("conversations");
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error("Failed to parse conversations from localStorage:", error);
		return [];
	}
};

// Function to save conversations to local storage
const saveConversationsToStorage = (conversations: Conversation[]): void => {
	try {
		localStorage.setItem("conversations", JSON.stringify(conversations));
	} catch (error) {
		console.error("Failed to save conversations to localStorage:", error);
	}
};

// Simple AI response generator function for fallback
const generateAIResponse = (message: string): string => {
	// Very simple response generation - used when API is not available
	const responses = [
		`I understood your message: "${message}". How can I help further?`,
		`Thanks for saying: "${message}". Is there anything else you'd like to know?`,
		`Regarding "${message}", I'd be happy to provide more information.`,
		`I've processed your request: "${message}". What would you like to do next?`,
		`I'm here to help with "${message}" and any other questions you might have.`,
	];

	return responses[Math.floor(Math.random() * responses.length)];
};

class AgentService {
	private apiUrl: string;
	private conversations: Conversation[];

	constructor() {
		// API URL for the backend
		this.apiUrl = "http://localhost:3001/api";
		// Initialize conversations from local storage
		this.conversations = getConversationsFromStorage();
	}

	// Set the API URL (can be used to change endpoint)
	setApiUrl(url: string): void {
		this.apiUrl = url;
	}

	// Get all conversations
	async getConversations(): Promise<Conversation[]> {
		// Return cached conversations
		return this.conversations;
	}

	// Get a specific conversation with messages
	async getConversation(id: string): Promise<Conversation | null> {
		const conversation = this.conversations.find((conv) => conv.id === id);
		return conversation || null;
	}

	// Create a new conversation
	async createConversation(title: string): Promise<Conversation> {
		const id = uuidv4();

		// Create new conversation
		const newConversation: Conversation = {
			id,
			title,
			messages: [],
		};

		// Try to create on API first
		try {
			const response = await fetch(`${this.apiUrl}/conversations`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, title }),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to create conversation: ${response.statusText}`,
				);
			}

			// If successful, we could use server response here
			console.log("Conversation created on server");
		} catch (error) {
			// Log the error but continue with local storage
			console.warn(
				"Could not create conversation on server, using local storage only",
				error,
			);
		}

		// Update local cache
		this.conversations.push(newConversation);
		saveConversationsToStorage(this.conversations);

		return newConversation;
	}

	// Send a message to the agent
	async sendMessage(conversationId: string, content: string): Promise<Message> {
		try {
			// Find the conversation
			const conversation = this.conversations.find(
				(c) => c.id === conversationId,
			);
			if (!conversation) {
				throw new Error(`Conversation not found: ${conversationId}`);
			}

			// Add user message to local cache
			const userMessage: Message = {
				id: uuidv4(),
				role: "user",
				content,
				created_at: new Date().toISOString(),
			};

			conversation.messages.push(userMessage);
			saveConversationsToStorage(this.conversations);

			let aiResponseContent: string;

			// Try to send to API
			try {
				// Send to API and get response
				const response = await fetch(
					`${this.apiUrl}/conversations/${conversationId}/messages`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ content }),
					},
				);

				if (!response.ok) {
					throw new Error(`Failed to send message: ${response.statusText}`);
				}

				// Get API response
				const apiResponse = await response.json();
				aiResponseContent = apiResponse.content;
				console.log("Using API response");
			} catch (error) {
				// Fall back to local response generation
				console.warn("API request failed, generating local response", error);
				aiResponseContent = generateAIResponse(content);
			}

			// Add assistant response to local cache
			const assistantMessage: Message = {
				id: uuidv4(),
				role: "assistant",
				content: aiResponseContent,
				created_at: new Date().toISOString(),
			};

			conversation.messages.push(assistantMessage);
			saveConversationsToStorage(this.conversations);

			return assistantMessage;
		} catch (error) {
			console.error(
				`Error sending message to conversation ${conversationId}:`,
				error,
			);

			// Create error message
			const errorMessage: Message = {
				id: uuidv4(),
				role: "assistant",
				content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
				created_at: new Date().toISOString(),
			};

			// Find the conversation and add error message
			const conversation = this.conversations.find(
				(c) => c.id === conversationId,
			);
			if (conversation) {
				conversation.messages.push(errorMessage);
				saveConversationsToStorage(this.conversations);
			}

			return errorMessage;
		}
	}

	// Delete a conversation
	async deleteConversation(id: string): Promise<boolean> {
		try {
			// Try to delete on server
			try {
				const response = await fetch(`${this.apiUrl}/conversations/${id}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error(
						`Failed to delete conversation: ${response.statusText}`,
					);
				}

				console.log("Conversation deleted on server");
			} catch (error) {
				console.warn("Could not delete conversation on server", error);
			}

			// Remove from local cache
			this.conversations = this.conversations.filter((c) => c.id !== id);
			saveConversationsToStorage(this.conversations);
			return true;
		} catch (error) {
			console.error(`Error deleting conversation ${id}:`, error);
			return false;
		}
	}

	// Update conversation title
	async updateConversationTitle(id: string, title: string): Promise<boolean> {
		try {
			// Try to update on server
			try {
				const response = await fetch(`${this.apiUrl}/conversations/${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title }),
				});

				if (!response.ok) {
					throw new Error(
						`Failed to update conversation: ${response.statusText}`,
					);
				}

				console.log("Conversation updated on server");
			} catch (error) {
				console.warn("Could not update conversation on server", error);
			}

			// Update in local cache
			const conversation = this.conversations.find((c) => c.id === id);
			if (conversation) {
				conversation.title = title;
				saveConversationsToStorage(this.conversations);
				return true;
			}
			return false;
		} catch (error) {
			console.error(`Error updating conversation ${id} title:`, error);
			return false;
		}
	}

	// Delete all conversations
	async clearAllConversations(): Promise<boolean> {
		try {
			// For each conversation, try to delete on server
			for (const conv of this.conversations) {
				try {
					await fetch(`${this.apiUrl}/conversations/${conv.id}`, {
						method: "DELETE",
					});
				} catch (error) {
					console.warn(
						`Could not delete conversation ${conv.id} on server`,
						error,
					);
				}
			}

			// Clear local cache
			this.conversations = [];
			saveConversationsToStorage(this.conversations);
			return true;
		} catch (error) {
			console.error("Error clearing all conversations:", error);
			return false;
		}
	}
}

// Export a singleton instance
export const agentService = new AgentService();

export default agentService;
