import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./App.css";
import agentService from "./services/agentService";
import type { Conversation } from "./services/agentService";

function App() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messageContainerRef = useRef<HTMLDivElement>(null);
	const { conversationId } = useParams<{ conversationId: string }>();
	const navigate = useNavigate();

	// Get active conversation
	const activeConversation = conversations.find(
		(conv) => conv.id === conversationId,
	);

	// Toggle sidebar
	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	// Scroll to bottom of messages
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	// Fetch conversations on component mount
	useEffect(() => {
		const loadConversations = async () => {
			const convs = await agentService.getConversations();
			setConversations(convs);
		};

		loadConversations();
	}, []);

	// Fetch active conversation data when conversationId changes
	useEffect(() => {
		if (conversationId) {
			const loadActiveConversation = async () => {
				const conversation = await agentService.getConversation(conversationId);
				if (conversation) {
					// Update the conversation in the list if it exists
					setConversations((prev) =>
						prev.map((conv) =>
							conv.id === conversation.id ? conversation : conv,
						),
					);
				} else {
					// Redirect to home if conversation doesn't exist
					navigate("/");
				}
			};

			loadActiveConversation();
		}
	}, [conversationId, navigate]);

	// Scroll to bottom when messages change
	useEffect(() => {
		if (activeConversation?.messages.length || loading) {
			scrollToBottom();
		}
	}, [activeConversation?.messages.length, loading, scrollToBottom]);

	// Create a new conversation
	const createNewConversation = useCallback(async () => {
		const title = "New Chat";
		const newConversation = await agentService.createConversation(title);

		setConversations((prev) => [...prev, newConversation]);
		navigate(`/chat/${newConversation.id}`);
	}, [navigate]);

	// Send message to agent
	const sendMessage = async () => {
		if (!inputMessage.trim()) return;

		try {
			setLoading(true);

			// If no active conversation, create one first
			let targetConversationId = conversationId;

			if (!targetConversationId) {
				const newConversation =
					await agentService.createConversation("New Chat");
				targetConversationId = newConversation.id;
				setConversations((prev) => [...prev, newConversation]);
				navigate(`/chat/${targetConversationId}`);
			}

			// Store current input and clear the field
			const currentMessage = inputMessage;
			setInputMessage("");

			// Send message to agent
			await agentService.sendMessage(targetConversationId, currentMessage);

			// Refresh conversation to get updated messages
			const updatedConversation =
				await agentService.getConversation(targetConversationId);

			if (updatedConversation) {
				setConversations((prev) =>
					prev.map((conv) =>
						conv.id === updatedConversation.id ? updatedConversation : conv,
					),
				);
			}

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
			setConversations((prev) => prev.filter((conv) => conv.id !== id));

			// If the deleted conversation was active, redirect to home
			if (conversationId === id) {
				navigate("/");
			}
		}
	};

	// Delete all conversations
	const clearAllConversations = async () => {
		const success = await agentService.clearAllConversations();

		if (success) {
			setConversations([]);
			navigate("/");
		}
	};

	// Handle key press in message input
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Handle click on sidebar conversation item
	const handleConversationClick = (convId: string) => {
		navigate(`/chat/${convId}`);
	};

	// Handle form submit
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		sendMessage();
	};

	return (
		<div className="flex h-screen bg-white">
			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#f7f7f8] border-r border-gray-200 transition-transform duration-300 md:relative ${
					sidebarOpen
						? "translate-x-0"
						: "-translate-x-full md:translate-x-0 md:w-0"
				}`}
			>
				<div className="flex flex-col h-full p-4">
					<button
						onClick={createNewConversation}
						type="button"
						className="mb-4 flex items-center justify-start gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="w-4 h-4"
							aria-hidden="true"
						>
							<path d="M12 5v14M5 12h14" />
						</svg>
						New conversation
					</button>

					<div className="flex-1 overflow-y-auto">
						{conversations.map((conv) => (
							<button
								key={conv.id}
								className={`mb-2 cursor-pointer rounded-lg p-3 hover:bg-gray-100 w-full text-left ${
									conversationId === conv.id ? "bg-gray-100" : ""
								}`}
								onClick={() => handleConversationClick(conv.id)}
								type="button"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="mr-2 h-4 w-4 text-gray-500"
											aria-hidden="true"
										>
											<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
										</svg>
										<span className="truncate">{conv.title}</span>
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											deleteConversation(conv.id);
										}}
										type="button"
										className="text-gray-400 hover:text-gray-600"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="h-4 w-4"
											aria-hidden="true"
										>
											<path d="M3 6h18" />
											<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
											<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
										</svg>
									</button>
								</div>
							</button>
						))}
					</div>

					<div className="mt-auto border-t border-gray-200 pt-4">
						<button
							onClick={clearAllConversations}
							type="button"
							className="flex w-full items-center justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-4 w-4"
								aria-hidden="true"
							>
								<path d="M3 6h18" />
								<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
							</svg>
							Clear conversations
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-1 flex-col h-full overflow-hidden">
				{/* Header */}
				<header className="flex items-center border-b border-gray-200 p-4">
					<button
						onClick={toggleSidebar}
						type="button"
						className="md:hidden rounded-md p-2 hover:bg-gray-100"
					>
						{sidebarOpen ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-5 w-5"
								aria-hidden="true"
							>
								<path d="M18 6 6 18" />
								<path d="m6 6 12 12" />
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-5 w-5"
								aria-hidden="true"
							>
								<path d="M3 12h18" />
								<path d="M3 6h18" />
								<path d="M3 18h18" />
							</svg>
						)}
					</button>
					<h1 className="ml-2 text-xl font-semibold">AI Chat</h1>
				</header>

				{/* Chat Area */}
				<div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4">
					{activeConversation && activeConversation.messages.length > 0 ? (
						<div className="mx-auto max-w-3xl space-y-6">
							{activeConversation.messages.map((message, index) => (
								<div
									key={`${activeConversation.id}-message-${index}`}
									className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[80%] rounded-lg p-4 ${
											message.role === "user"
												? "bg-blue-500 text-white rounded-br-none"
												: "bg-gray-100 text-gray-800 rounded-bl-none"
										}`}
									>
										{message.content}
									</div>
								</div>
							))}

							{loading && (
								<div className="flex justify-start">
									<div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none max-w-[80%] p-4">
										<div className="flex space-x-2">
											<div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
											<div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100" />
											<div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200" />
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
					) : (
						<div className="h-full flex flex-col items-center justify-center text-center p-8">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-12 w-12 text-gray-400 mb-4"
								aria-hidden="true"
							>
								<path d="M12 3C6.5 3 2 6.5 2 11c0 1.4.4 2.6 1 3.8L1 18l3.3-1.1c1.6 1.5 4.5 2.1 6.7 2.1 5.5 0 10-4.5 10-9S17.5 3 12 3m0 0" />
								<path d="M12 7v6" />
								<path d="M9 10h6" />
							</svg>
							<h2 className="text-2xl font-semibold mb-2">
								How can I help you today?
							</h2>
							<p className="text-gray-500 max-w-md">
								Ask me anything! I can help with information, creative tasks,
								problem-solving, and more.
							</p>
						</div>
					)}
				</div>

				{/* Input Area */}
				<div className="border-t border-gray-200 p-4">
					<form
						onSubmit={handleSubmit}
						className="mx-auto flex max-w-3xl space-x-2"
					>
						<input
							type="text"
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={loading}
							placeholder="Type your message..."
							className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
						/>
						<button
							type="submit"
							disabled={loading || !inputMessage.trim()}
							className="flex items-center justify-center rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-5 w-5"
								aria-hidden="true"
							>
								<path d="m22 2-7 20-4-9-9-4Z" />
								<path d="M22 2 11 13" />
							</svg>
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default App;
