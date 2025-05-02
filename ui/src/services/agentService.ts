// Types matching the agent
export interface Message {
	role: "user" | "assistant";
	content: string;
}

export interface Conversation {
	id: string;
	title: string;
	messages: Message[];
}

class AgentService {
	private apiUrl: string;

	constructor() {
		// Hardcoded API URL for development
		this.apiUrl = "http://localhost:3001/api";
	}

	// Get all conversations
	async getConversations(): Promise<Conversation[]> {
		try {
			const response = await fetch(`${this.apiUrl}/conversations`);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch conversations: ${response.statusText}`,
				);
			}
			return await response.json();
		} catch (error) {
			console.error("Error fetching conversations:", error);
			return [];
		}
	}

	// Get a specific conversation
	async getConversation(id: string): Promise<Conversation | null> {
		try {
			const response = await fetch(`${this.apiUrl}/conversations/${id}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch conversation: ${response.statusText}`);
			}
			return await response.json();
		} catch (error) {
			console.error(`Error fetching conversation ${id}:`, error);
			return null;
		}
	}

	// Create a new conversation
	async createConversation(title: string): Promise<Conversation> {
		try {
			const response = await fetch(`${this.apiUrl}/conversations`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title }),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to create conversation: ${response.statusText}`,
				);
			}

			return await response.json();
		} catch (error) {
			console.error("Error creating conversation:", error);
			throw error;
		}
	}

	// Send a message to the agent
	async sendMessage(conversationId: string, content: string): Promise<Message> {
		try {
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

			return await response.json();
		} catch (error) {
			console.error(
				`Error sending message to conversation ${conversationId}:`,
				error,
			);
			const errorMessage: Message = {
				role: "assistant",
				content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
			return errorMessage;
		}
	}

	// Delete a conversation
	async deleteConversation(id: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.apiUrl}/conversations/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error(
					`Failed to delete conversation: ${response.statusText}`,
				);
			}

			const data = await response.json();
			return data.success;
		} catch (error) {
			console.error(`Error deleting conversation ${id}:`, error);
			return false;
		}
	}

	// Update conversation title
	async updateConversationTitle(id: string, title: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.apiUrl}/conversations/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title }),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to update conversation title: ${response.statusText}`,
				);
			}

			return true;
		} catch (error) {
			console.error(`Error updating conversation ${id} title:`, error);
			return false;
		}
	}
}

// Export a singleton instance
export const agentService = new AgentService();

export default agentService;
