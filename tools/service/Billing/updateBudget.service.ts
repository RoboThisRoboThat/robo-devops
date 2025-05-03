import {
	BudgetsClient,
	UpdateBudgetCommand,
	DescribeBudgetCommand,
	DeleteNotificationCommand,
	type Budget,
	type NotificationWithSubscribers,
} from "@aws-sdk/client-budgets";
import { z } from "zod";
import BaseService from "../base.service";
class UpdateBudgetService {
	/**
	 * Updates an existing AWS budget
	 * @param region Specifies the AWS region for Budgets
	 * @param budgetName The name of the budget to update
	 * @param newBudgetName The new name for the budget
	 * @param limitAmount The new limit amount
	 * @param limitUnit The new limit unit
	 * @param timeUnit The new time unit
	 * @param timePeriodStart The new start date
	 * @param timePeriodEnd The new end date
	 * @param costFilters The updated cost filters
	 * @param usageFilters The updated usage filters
	 * @param notificationsWithSubscribersToAdd JSON for new notifications and subscribers
	 * @param notificationsWithSubscribersToUpdate JSON for updating existing notifications
	 * @param notificationNamesToDelete A comma-separated list of notification names to delete
	 * @returns Promise containing the result of the budget update
	 */

	toolName = "update-budget";
	description = "Updates an existing AWS budget";
	updateBudgetInput = {
		region: z
			.string()
			.default("us-east-1")
			.describe("Specifies the AWS region for Budgets (typically us-east-1)"),
		budgetName: z.string().describe("The name of the budget to update"),
		newBudgetName: z
			.string()
			.optional()
			.describe("The new name for the budget"),
		limitAmount: z.string().optional().describe("The new limit amount"),
		limitUnit: z.string().optional().describe("The new limit unit"),
		timeUnit: z
			.enum(["DAILY", "MONTHLY", "QUARTERLY", "ANNUALLY"])
			.optional()
			.describe("The new time unit"),
		timePeriodStart: z
			.string()
			.optional()
			.describe("The new start date in YYYY-MM-DD format"),
		timePeriodEnd: z
			.string()
			.optional()
			.describe("The new end date in YYYY-MM-DD format"),
		costFilters: z
			.string()
			.optional()
			.describe("A JSON string defining updated cost filters"),
		usageFilters: z
			.string()
			.optional()
			.describe("A JSON string defining updated usage filters"),
		notificationsWithSubscribersToAdd: z
			.string()
			.optional()
			.describe(
				"A JSON string defining new notifications and subscribers to add",
			),
		notificationsWithSubscribersToUpdate: z
			.string()
			.optional()
			.describe(
				"A JSON string defining existing notifications and subscribers to update",
			),
		notificationNamesToDelete: z
			.string()
			.optional()
			.describe("A comma-separated list of notification names to delete"),
	};

	updateBudgetZodInput = z.object(this.updateBudgetInput);

	async updateBudget({
		region = "us-east-1",
		budgetName,
		newBudgetName,
		limitAmount,
		limitUnit,
		timeUnit,
		timePeriodStart,
		timePeriodEnd,
		costFilters,
		usageFilters,
		notificationsWithSubscribersToAdd,
		notificationsWithSubscribersToUpdate,
		notificationNamesToDelete,
	}: {
		region?: string;
		budgetName: string;
		newBudgetName?: string;
		limitAmount?: string;
		limitUnit?: string;
		timeUnit?: "DAILY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
		timePeriodStart?: string;
		timePeriodEnd?: string;
		costFilters?: string;
		usageFilters?: string;
		notificationsWithSubscribersToAdd?: string;
		notificationsWithSubscribersToUpdate?: string;
		notificationNamesToDelete?: string;
	}) {
		try {
			// Create a new BudgetsClient with the provided region
			const budgetsClient = new BudgetsClient({ region });

			// First, get the current budget definition
			const describeBudgetCommand = new DescribeBudgetCommand({
				AccountId: "self",
				BudgetName: budgetName,
			});

			const currentBudgetResponse = await budgetsClient.send(
				describeBudgetCommand,
			);
			if (!currentBudgetResponse.Budget) {
				throw new Error(`Budget ${budgetName} not found`);
			}

			const currentBudget = currentBudgetResponse.Budget;

			// Create a new budget object based on the current one
			const updatedBudget: Budget = { ...currentBudget };

			// Update fields if provided
			if (newBudgetName) {
				updatedBudget.BudgetName = newBudgetName;
			}

			if (limitAmount || limitUnit) {
				if (!updatedBudget.BudgetLimit) {
					updatedBudget.BudgetLimit = {
						Amount: limitAmount || "0",
						Unit: limitUnit || "USD",
					};
				} else {
					if (limitAmount) {
						updatedBudget.BudgetLimit.Amount = limitAmount;
					}
					if (limitUnit) {
						updatedBudget.BudgetLimit.Unit = limitUnit;
					}
				}
			}

			if (timeUnit) {
				updatedBudget.TimeUnit = timeUnit;
			}

			if (timePeriodStart || timePeriodEnd) {
				if (!updatedBudget.TimePeriod) {
					updatedBudget.TimePeriod = {};
				}

				if (timePeriodStart) {
					updatedBudget.TimePeriod.Start = new Date(timePeriodStart);
				}

				if (timePeriodEnd) {
					updatedBudget.TimePeriod.End = new Date(timePeriodEnd);
				}
			}

			// Parse and update cost filters if provided
			if (costFilters) {
				try {
					updatedBudget.CostFilters = JSON.parse(costFilters);
				} catch (error) {
					throw new Error("Invalid cost filters JSON format");
				}
			}

			// Parse and update usage filters if provided
			if (usageFilters && updatedBudget.BudgetType === "USAGE") {
				try {
					updatedBudget.UsageFilters = JSON.parse(usageFilters);
				} catch (error) {
					throw new Error("Invalid usage filters JSON format");
				}
			}

			// Update the budget
			const updateBudgetCommand = new UpdateBudgetCommand({
				AccountId: "self",
				NewBudget: updatedBudget,
			});

			await budgetsClient.send(updateBudgetCommand);

			// Handle notifications with subscribers to add
			if (notificationsWithSubscribersToAdd) {
				try {
					const notificationsToAdd: NotificationWithSubscribers[] = JSON.parse(
						notificationsWithSubscribersToAdd,
					);

					for (const notification of notificationsToAdd) {
						await budgetsClient.send({
							AccountId: "self",
							BudgetName: newBudgetName || budgetName,
							Notification: notification.Notification,
							Subscribers: notification.Subscribers,
						});
					}
				} catch (error) {
					throw new Error(
						"Invalid notifications with subscribers to add JSON format",
					);
				}
			}

			// Handle notifications with subscribers to update
			if (notificationsWithSubscribersToUpdate) {
				try {
					const notificationsToUpdate: NotificationWithSubscribers[] =
						JSON.parse(notificationsWithSubscribersToUpdate);

					for (const notification of notificationsToUpdate) {
						await budgetsClient.send({
							AccountId: "self",
							BudgetName: newBudgetName || budgetName,
							OldNotification: notification.Notification,
							NewNotification: notification.Notification,
							Subscribers: notification.Subscribers,
						});
					}
				} catch (error) {
					throw new Error(
						"Invalid notifications with subscribers to update JSON format",
					);
				}
			}

			// Handle notifications to delete
			if (notificationNamesToDelete) {
				const notificationNames = notificationNamesToDelete
					.split(",")
					.map((name) => name.trim());

				for (const notificationName of notificationNames) {
					await budgetsClient.send(
						new DeleteNotificationCommand({
							AccountId: "self",
							BudgetName: newBudgetName || budgetName,
							Notification: {
								NotificationType: notificationName,
								ComparisonOperator: "GREATER_THAN",
								Threshold: 100,
							},
						}),
					);
				}
			}

			return {
				success: true,
				message: `Budget ${budgetName} updated successfully`,
			};
		} catch (error) {
			console.error(`Error updating budget ${budgetName}:`, error);
			throw error;
		}
	}
}

const updateBudgetService = new UpdateBudgetService();

export default new BaseService(
	updateBudgetService.toolName,
	updateBudgetService.description,
	updateBudgetService.updateBudgetInput,
	updateBudgetService.updateBudgetZodInput,
	updateBudgetService.updateBudget,
);
