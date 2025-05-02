import { Hono } from "hono";
import { cors } from "hono/cors";
import { deploymentAgent } from "./index";
import type { Conversation } from "./index";

const app = new Hono();
const PORT = process.env.PORT || 3001;

// Middleware
app.use("/*", cors());

// Get all conversations
app.get("/api/conversations", (c) => {
	try {
		const conversations = deploymentAgent.listConversations();
		return c.json(conversations);
	} catch (error) {
		console.error("Error listing conversations:", error);
		return c.json({ error: "Failed to retrieve conversations" }, 500);
	}
});

// Get a single conversation
app.get("/api/conversations/:id", (c) => {
	try {
		const id = c.req.param("id");
		const conversation = deploymentAgent.getConversation(id);
		if (!conversation) {
			return c.json({ error: "Conversation not found" }, 404);
		}
		return c.json(conversation);
	} catch (error) {
		console.error(`Error getting conversation ${c.req.param("id")}:`, error);
		return c.json({ error: "Failed to retrieve conversation" }, 500);
	}
});

// Create a new conversation
app.post("/api/conversations", async (c) => {
	try {
		const body = await c.req.json();
		const { title = "New Conversation" } = body;
		const conversation = deploymentAgent.createConversation(title);
		return c.json(conversation, 201);
	} catch (error) {
		console.error("Error creating conversation:", error);
		return c.json({ error: "Failed to create conversation" }, 500);
	}
});

// Delete a conversation
app.delete("/api/conversations/:id", (c) => {
	try {
		const id = c.req.param("id");
		const success = deploymentAgent.deleteConversation(id);
		if (!success) {
			return c.json({ error: "Conversation not found" }, 404);
		}
		return c.json({ success: true });
	} catch (error) {
		console.error(`Error deleting conversation ${c.req.param("id")}:`, error);
		return c.json({ error: "Failed to delete conversation" }, 500);
	}
});

// Update conversation title
app.patch("/api/conversations/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const { title } = body;

		if (!title) {
			return c.json({ error: "Title is required" }, 400);
		}

		const conversation = deploymentAgent.getConversation(id);
		if (!conversation) {
			return c.json({ error: "Conversation not found" }, 404);
		}

		// Update title (create a new conversation with same data but new title)
		const updatedConversation: Conversation = {
			...conversation,
			title,
		};

		// Delete old conversation and add new one
		deploymentAgent.deleteConversation(id);
		deploymentAgent.createConversation(title);

		return c.json(updatedConversation);
	} catch (error) {
		console.error(`Error updating conversation ${c.req.param("id")}:`, error);
		return c.json({ error: "Failed to update conversation" }, 500);
	}
});

// Send a message to a conversation
app.post("/api/conversations/:id/messages", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const { content } = body;

		if (!content) {
			return c.json({ error: "Message content is required" }, 400);
		}

		const response = await deploymentAgent.sendMessage(id, content);
		if (!response) {
			return c.json({ error: "Conversation not found" }, 404);
		}

		return c.json(response);
	} catch (error) {
		console.error(
			`Error sending message to conversation ${c.req.param("id")}:`,
			error,
		);
		return c.json({ error: "Failed to send message" }, 500);
	}
});

Bun.serve({
	port: PORT,
	fetch: app.fetch,
	development: process.env.NODE_ENV !== "production",
});
console.log(`Agent API server running on port ${PORT}`);
