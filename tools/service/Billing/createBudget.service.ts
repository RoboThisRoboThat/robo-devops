import {
	BudgetsClient,
	CreateBudgetCommand,
	type Budget,
	type BudgetType,
	type Notification,
	type Subscriber,
} from "@aws-sdk/client-budgets";
import { z } from "zod";
import { readFileSync } from "fs";

class CreateBudgetService {
	/**
	 * Creates a new AWS budget
	 * @param region Specifies the AWS region for Budgets
	 * @param budgetName The name of the new budget
	 * @param budgetType The type of budget (COST or USAGE)
	 * @param limitAmount The limit for the budget
	 * @param limitUnit The unit for the limit amount
	 * @param timeUnit The period for the budget
	 * @param timePeriodStart The start date for the budget
	 * @param timePeriodEnd Optional end date for the budget
	 * @param costFilters Optional cost filters
	 * @param usageFilters Optional usage filters
	 * @param notificationsWithSubscribers Optional notifications and subscribers
	 * @returns Promise containing details of the created budget
	 */

	toolName = "create-budget";
	description = "Creates a new AWS budget to track costs or usage";

	createBudgetInput = {
		region: z
			.string()
			.optional()
			.default("us-east-1")
			.describe("Specifies the AWS region for Budgets"),
		budgetName: z.string().describe("The name of the new budget"),
		budgetType: z
			.enum(["COST", "USAGE"])
			.describe("The type of budget (COST or USAGE)"),
		limitAmount: z.string().describe("The limit for the budget (e.g., 100.00)"),
		limitUnit: z
			.string()
			.describe("The unit for the limit amount (e.g., USD, GB)"),
		timeUnit: z
			.enum(["DAILY", "MONTHLY", "QUARTERLY", "ANNUALLY"])
			.describe("The period for the budget"),
		timePeriodStart: z
			.string()
			.describe("The start date for the budget in YYYY-MM-DD format"),
		timePeriodEnd: z
			.string()
			.optional()
			.describe(
				"The end date for the budget in YYYY-MM-DD format (if not recurring)",
			),
		costFilters: z
			.union([
				z.string().describe("A JSON string defining cost filters"),
				z.string().describe("Path to a JSON file defining cost filters"),
			])
			.optional(),
		usageFilters: z
			.union([
				z.string().describe("A JSON string defining usage filters"),
				z.string().describe("Path to a JSON file defining usage filters"),
			])
			.optional(),
		notificationsWithSubscribers: z
			.union([
				z
					.string()
					.describe("A JSON string defining notifications and subscribers"),
				z
					.string()
					.describe(
						"Path to a JSON file defining notifications and subscribers",
					),
			])
			.optional(),
	};

	createBudgetZodInput = z.object(this.createBudgetInput);

	async createBudget({
		region = "us-east-1",
		budgetName,
		budgetType,
		limitAmount,
		limitUnit,
		timeUnit,
		timePeriodStart,
		timePeriodEnd,
		costFilters,
		usageFilters,
		notificationsWithSubscribers,
	}: {
		region?: string;
		budgetName: string;
		budgetType: "COST" | "USAGE";
		limitAmount: string;
		limitUnit: string;
		timeUnit: "DAILY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
		timePeriodStart: string;
		timePeriodEnd?: string;
		costFilters?: string;
		usageFilters?: string;
		notificationsWithSubscribers?: string;
	}): Promise<{
		budgetName: string;
		budgetType: string;
		limitAmount: string;
		limitUnit: string;
		timeUnit: string;
		creationSuccess: boolean;
	}> {
		try {
			// Create a new BudgetsClient for the specified region
			const budgetsClient = new BudgetsClient({ region });

			// Parse cost filters
			let parsedCostFilters: Record<string, string[]> = {};
			if (costFilters) {
				parsedCostFilters = this.parseJsonOrFile(costFilters);
			}

			// Parse usage filters
			let parsedUsageFilters: Record<string, string[]> = {};
			if (usageFilters && budgetType === "USAGE") {
				parsedUsageFilters = this.parseJsonOrFile(usageFilters);
			}

			// Parse notifications with subscribers
			let parsedNotificationsWithSubscribers: {
				notification: Notification;
				subscribers: Subscriber[];
			}[] = [];

			if (notificationsWithSubscribers) {
				parsedNotificationsWithSubscribers = this.parseJsonOrFile(
					notificationsWithSubscribers,
				);
			}

			// Create the budget object
			const budget: Budget = {
				BudgetName: budgetName,
				BudgetType: budgetType as BudgetType,
				BudgetLimit: {
					Amount: limitAmount,
					Unit: limitUnit,
				},
				TimeUnit: timeUnit,
				TimePeriod: {
					Start: new Date(timePeriodStart),
					End: timePeriodEnd ? new Date(timePeriodEnd) : undefined,
				},
				CostFilters: parsedCostFilters,
			};

			// Add usage filters if applicable
			if (
				budgetType === "USAGE" &&
				Object.keys(parsedUsageFilters).length > 0
			) {
				budget.CostFilters = parsedUsageFilters;
			}

			// Create the command
			const command = new CreateBudgetCommand({
				AccountId: await this.getAwsAccountId(),
				Budget: budget,
				NotificationsWithSubscribers: parsedNotificationsWithSubscribers,
			});

			// Send the command
			await budgetsClient.send(command);

			return {
				budgetName,
				budgetType,
				limitAmount,
				limitUnit,
				timeUnit,
				creationSuccess: true,
			};
		} catch (error) {
			console.error("Error creating budget:", error);
			throw error;
		}
	}

	/**
	 * Parse JSON string or load from file
	 * @param input JSON string or file path
	 * @returns Parsed JSON object
	 */
	private parseJsonOrFile(input: string): any {
		try {
			// First try to parse as JSON string
			return JSON.parse(input);
		} catch (error) {
			// If parsing fails, try to load from file
			try {
				const fileContent = readFileSync(input, "utf-8");
				return JSON.parse(fileContent);
			} catch (fileError) {
				throw new Error(`Failed to parse JSON or load from file: ${input}`);
			}
		}
	}

	/**
	 * Get the AWS account ID from the STS service
	 * @returns Promise containing the AWS account ID
	 */
	private async getAwsAccountId(): Promise<string> {
		// In a real implementation, you would use the STS client to get the account ID
		// For now, we'll use a placeholder
		return "123456789012"; // This should be replaced with actual STS call
	}
}

export default new CreateBudgetService();
