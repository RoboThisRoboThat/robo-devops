import { BudgetsClient, ListBudgetsCommand } from "@aws-sdk/client-budgets";
import { z } from "zod";

class ListBudgetsService {
	/**
	 * Lists all configured AWS budgets
	 * @param region Specifies the AWS region for Budgets
	 * @returns Promise containing a list of all AWS budgets
	 */

	toolName = "list-budgets";
	description = "Lists your AWS budgets";
	listBudgetsInput = {
		region: z
			.string()
			.default("us-east-1")
			.describe("Specifies the AWS region for Budgets (typically us-east-1)"),
	};

	listBudgetsZodInput = z.object(this.listBudgetsInput);

	async listBudgets({
		region = "us-east-1",
	}: {
		region?: string;
	}) {
		try {
			// Create a new BudgetsClient with the provided region
			const budgetsClient = new BudgetsClient({ region });

			// Get all budgets (handles pagination internally)
			const allBudgets = [];
			let nextToken;

			do {
				const command = new ListBudgetsCommand({
					NextToken: nextToken,
				});

				const response = await budgetsClient.send(command);

				if (response.Budgets) {
					allBudgets.push(...response.Budgets);
				}

				nextToken = response.NextToken;
			} while (nextToken);

			return {
				Budgets: allBudgets,
			};
		} catch (error) {
			console.error("Error listing budgets:", error);
			throw error;
		}
	}
}

export default new ListBudgetsService();
