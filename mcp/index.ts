import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import tools from "../tools";

const server = new McpServer({
	name: "aws-devops",
	version: "1.0.0",
	capabilities: {
		resources: {},
		tools: {},
	},
});

// Register all tools from the tools array
for (const tool of tools) {
	server.tool(
		tool.toolName,
		tool.description,
		tool.inputSchema,
		async (params: Record<string, unknown>) => {
			try {
				const result = await tool.execute(params);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(result),
						},
					],
				};
			} catch (error) {
				console.error(`Error executing ${tool.toolName}:`, error);
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
}

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
