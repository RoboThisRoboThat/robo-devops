# Deployment MCP

This project consists of two main components:
1. **Agent**: A backend server powered by LangChain and Hono that provides the backend API.
2. **UI**: A React frontend that communicates with the agent API.

## Setup and Running

### Prerequisites
- Node.js 18+ or Bun runtime
- OpenAI API key

### Agent Setup

1. Set your OpenAI API key as an environment variable:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key
   ```

2. Start the agent server:
   ```bash
   cd agent
   bun install
   bun start
   ```

   The agent server will run on http://localhost:3001 by default.

### UI Setup

1. Start the UI development server:
   ```bash
   cd ui
   npm install
   npm run dev
   ```

   The UI will be available at http://localhost:5173

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Create a new conversation or use an existing one
3. Type your message and press Enter or click Send
4. The agent will process your request and provide a response

## Troubleshooting

- If you encounter CORS issues, make sure the agent server is running on port 3001
- If responses are not coming through, check the console for any error messages
- Ensure your OpenAI API key is valid and has sufficient quota
