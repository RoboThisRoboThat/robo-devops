import type { z } from "zod";

/**
 * Base service class to standardize all AWS service tools
 * This class provides a consistent structure for all tool implementations
 */
class BaseService {
	toolName: string;
	description: string;
	inputSchema: Record<string, z.ZodTypeAny>;
	zodSchema: z.ZodObject<Record<string, z.ZodTypeAny>>;
	execute: (params: Record<string, unknown>) => Promise<unknown>;

	constructor(
		toolName: string,
		description: string,
		inputSchema: Record<string, z.ZodTypeAny>,
		zodSchema: z.ZodObject<Record<string, z.ZodTypeAny>>,
		execute: (params: Record<string, unknown>) => Promise<unknown>,
	) {
		this.toolName = toolName;
		this.description = description;
		this.inputSchema = inputSchema;
		this.zodSchema = zodSchema;
		this.execute = execute;
	}
}

export default BaseService;
