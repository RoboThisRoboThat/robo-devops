import { useState, useEffect, useCallback } from "react";
import "./App.css";
import agentService, { Conversation, Message } from "./services/agentService";

function App() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [activeConversationId, setActiveConversationId] = useState<
		string | null
	>(null);
	const [inputMessage, setInputMessage] = useState("");
	const [loading, setLoading] = useState(false);

	// Fetch conversations on component mount
	useEffect(() => {
		const loadConversations = async () => {
			const convs = await agentService.getConversations();
			setConversations(convs);

			// Set active conversation if exists
			if (convs.length > 0 && !activeConversationId) {
				setActiveConversationId(convs[0].id);
			}
		};

		loadConversations();
	}, [activeConversationId]);

	// Create a new conversation
	const createNewConversation = useCallback(async () => {
		const title = `New Chat ${conversations.length + 1}`;
		const newConversation = await agentService.createConversation(title);

		setConversations((prev) => [...prev, newConversation]);
		setActiveConversationId(newConversation.id);
	}, [conversations.length]);

	// Get active conversation
	const activeConversation = conversations.find(
		(conv) => conv.id === activeConversationId,
	);

	// Initialize first conversation if none exists
	useEffect(() => {
		if (conversations.length === 0) {
			createNewConversation();
		}
	}, [conversations.length, createNewConversation]);

	// Send message to agent
	const sendMessage = async () => {
		if (!inputMessage.trim() || !activeConversationId) return;

		try {
			setLoading(true);
			setInputMessage("");

			// Send message to agent
			await agentService.sendMessage(activeConversationId, inputMessage);

			// Refresh conversations to get updated messages
			const updatedConversations = await agentService.getConversations();
			setConversations(updatedConversations);

			setLoading(false);
		} catch (error) {
			console.error("Error sending message:", error);
			setLoading(false);
		}
	};

	// Delete conversation
	const deleteConversation = async (id: string) => {
		const success = await agentService.deleteConversation(id);

		if (success) {
			const updatedConversations = await agentService.getConversations();
			setConversations(updatedConversations);

			if (activeConversationId === id) {
				setActiveConversationId(
					updatedConversations.length > 0 ? updatedConversations[0].id : null,
				);
			}

			if (updatedConversations.length === 0) {
				createNewConversation();
			}
		}
	};

	// Update conversation title
	const updateConversationTitle = async (id: string, newTitle: string) => {
		const success = await agentService.updateConversationTitle(id, newTitle);

		if (success) {
			const updatedConversations = await agentService.getConversations();
			setConversations(updatedConversations);
		}
	};

	// Handle key press in message input
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			sendMessage();
		}
	};

	// Handle click on sidebar conversation item
	const handleConversationClick = (convId: string) => {
		setActiveConversationId(convId);
	};

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
				<div className="mb-4">
					<button
						onClick={createNewConversation}
						type="button"
						className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center"
					>
						<span>New Chat</span>
					</button>
				</div>

				<div className="flex-1 overflow-y-auto">
					{conversations.map((conv) => (
						<button
							key={conv.id}
							className={`p-2 mb-1 rounded cursor-pointer flex justify-between items-center w-full text-left ${activeConversationId === conv.id ? "bg-gray-700" : "hover:bg-gray-700"}`}
							onClick={() => handleConversationClick(conv.id)}
							type="button"
						>
							<div className="truncate flex-1">{conv.title}</div>
							<button
								onClick={(e) => {
									e.stopPropagation();
									deleteConversation(conv.id);
								}}
								type="button"
								className="text-gray-400 hover:text-white"
							>
								×
							</button>
						</button>
					))}
				</div>
			</div>

			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col">
				{/* Chat header */}
				<div className="bg-white border-b p-4 flex items-center">
					{activeConversation ? (
						<input
							type="text"
							value={activeConversation.title}
							onChange={(e) =>
								updateConversationTitle(activeConversation.id, e.target.value)
							}
							className="bg-transparent outline-none font-medium"
						/>
					) : (
						<div className="font-medium">Select a conversation</div>
					)}
				</div>

				{/* Messages area */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{activeConversation &&
						activeConversation.messages.map((msg, index) => (
							<div
								key={`${activeConversation.id}-message-${index}`}
								className={`p-3 rounded-lg max-w-3xl ${
									msg.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-200"
								}`}
							>
								{msg.content}
							</div>
						))}

					{loading && (
						<div className="bg-gray-200 p-3 rounded-lg max-w-3xl flex space-x-2">
							<div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
							<div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
							<div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
						</div>
					)}
				</div>

				{/* Input area */}
				<div className="border-t p-4 bg-white">
					<div className="flex items-center">
						<input
							type="text"
							placeholder="Type your message..."
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={!activeConversationId || loading}
							className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							onClick={sendMessage}
							type="button"
							disabled={!activeConversationId || loading}
							className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r disabled:bg-blue-300"
						>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
