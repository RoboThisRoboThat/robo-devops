import { BudgetsClient, DescribeBudgetCommand } from "@aws-sdk/client-budgets";
import { z } from "zod";

class DescribeBudgetService {
	/**
	 * Describes a specific AWS budget
	 * @param region Specifies the AWS region for Budgets
	 * @param budgetName The name of the budget to describe
	 * @returns Promise containing detailed information about the specified budget
	 */

	toolName = "describe-budget";
	description = "Describes a specific AWS budget";
	describeBudgetInput = {
		region: z
			.string()
			.default("us-east-1")
			.describe("Specifies the AWS region for Budgets (typically us-east-1)"),
		budgetName: z.string().describe("The name of the budget to describe"),
	};

	describeBudgetZodInput = z.object(this.describeBudgetInput);

	async describeBudget({
		region = "us-east-1",
		budgetName,
	}: {
		region?: string;
		budgetName: string;
	}) {
		try {
			// Create a new BudgetsClient with the provided region
			const budgetsClient = new BudgetsClient({ region });

			const command = new DescribeBudgetCommand({
				BudgetName: budgetName,
			});

			const response = await budgetsClient.send(command);
			return response;
		} catch (error) {
			console.error(`Error describing budget ${budgetName}:`, error);
			throw error;
		}
	}
}

export default new DescribeBudgetService();
