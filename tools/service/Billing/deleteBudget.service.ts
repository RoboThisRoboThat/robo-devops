import { BudgetsClient, DeleteBudgetCommand } from "@aws-sdk/client-budgets";
import { z } from "zod";

class DeleteBudgetService {
	/**
	 * Deletes a specified AWS budget
	 * @param region Specifies the AWS region for Budgets
	 * @param budgetName The name of the budget to delete
	 * @returns Promise containing the result of the budget deletion
	 */

	toolName = "delete-budget";
	description = "Deletes a specified AWS budget";
	deleteBudgetInput = {
		region: z
			.string()
			.default("us-east-1")
			.describe("Specifies the AWS region for Budgets (typically us-east-1)"),
		budgetName: z.string().describe("The name of the budget to delete"),
	};

	deleteBudgetZodInput = z.object(this.deleteBudgetInput);

	async deleteBudget({
		region = "us-east-1",
		budgetName,
	}: {
		region?: string;
		budgetName: string;
	}) {
		try {
			// Create a new BudgetsClient with the provided region
			const budgetsClient = new BudgetsClient({ region });

			const command = new DeleteBudgetCommand({
				AccountId: "self",
				BudgetName: budgetName,
			});

			const response = await budgetsClient.send(command);
			return {
				success: true,
				message: `Budget ${budgetName} deleted successfully`,
			};
		} catch (error) {
			console.error(`Error deleting budget ${budgetName}:`, error);
			throw error;
		}
	}
}

export default new DeleteBudgetService();
