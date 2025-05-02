import {
	CloudFrontClient,
	GetDistributionConfigCommand,
	DeleteDistributionCommand,
	UpdateDistributionCommand,
	type GetDistributionConfigCommandOutput,
} from "@aws-sdk/client-cloudfront";
import { z } from "zod";

class DeleteDistributionService {
	/**
	 * Deletes a specified CloudFront distribution
	 * @param distributionId ID of the CloudFront distribution to delete
	 * @param ifMatch The current ETag value for the distribution
	 * @param force If true, attempts to disable the distribution before deleting it
	 * @returns Promise containing the result of the delete operation
	 */

	toolName = "delete-cloudfront-distribution";
	description =
		"Deletes a specified CloudFront distribution. Note: A distribution must be disabled before it can be deleted.";

	deleteDistributionInput = {
		distributionId: z
			.string()
			.describe("Specifies the ID of the CloudFront distribution to delete"),
		ifMatch: z.string().describe("The current ETag value for the distribution"),
		force: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"If provided, attempts to disable the distribution before deleting it if it's currently enabled. Use with caution",
			),
	};

	deleteDistributionZodInput = z.object(this.deleteDistributionInput);

	async deleteDistribution({
		distributionId,
		ifMatch,
		force = false,
	}: {
		distributionId: string;
		ifMatch: string;
		force?: boolean;
	}): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			// Create CloudFront client
			const client = new CloudFrontClient({});

			if (force) {
				// If force is true, try to disable the distribution first
				const getConfigCommand = new GetDistributionConfigCommand({
					Id: distributionId,
				});

				const configResponse: GetDistributionConfigCommandOutput =
					await client.send(getConfigCommand);

				if (!configResponse.DistributionConfig || !configResponse.ETag) {
					throw new Error(
						`Distribution configuration for ${distributionId} not found`,
					);
				}

				// Check if the distribution is already disabled
				if (configResponse.DistributionConfig.Enabled === false) {
					console.log(
						`Distribution ${distributionId} is already disabled, proceeding with deletion`,
					);
				} else {
					console.log(
						`Disabling distribution ${distributionId} before deletion`,
					);

					// Update the distribution to disable it
					const disabledConfig = {
						...configResponse.DistributionConfig,
						Enabled: false,
					};

					const updateCommand = new UpdateDistributionCommand({
						Id: distributionId,
						IfMatch: configResponse.ETag,
						DistributionConfig: disabledConfig,
					});

					const updateResponse = await client.send(updateCommand);

					// Wait for the distribution to be deployed with disabled state
					console.log(
						`Distribution ${distributionId} is being disabled. This may take some time to propagate.`,
					);
					console.log(
						`You may need to wait and retry the deletion operation later.`,
					);

					// Use the new ETag for deletion
					ifMatch = updateResponse.ETag || ifMatch;
				}
			}

			// Now attempt to delete the distribution
			const deleteCommand = new DeleteDistributionCommand({
				Id: distributionId,
				IfMatch: ifMatch,
			});

			await client.send(deleteCommand);

			return {
				success: true,
				message: `CloudFront distribution ${distributionId} deleted successfully`,
			};
		} catch (error: any) {
			// Handle specific error cases
			if (error.name === "DistributionNotDisabled") {
				return {
					success: false,
					message: `Distribution ${distributionId} is not disabled. You must disable it before deletion, or use the force option.`,
				};
			} else if (error.name === "PreconditionFailed") {
				return {
					success: false,
					message: `The provided ETag (${ifMatch}) doesn't match the current ETag for distribution ${distributionId}. Please get the latest ETag and try again.`,
				};
			} else if (error.name === "NoSuchDistribution") {
				return {
					success: false,
					message: `Distribution ${distributionId} not found.`,
				};
			}

			// For other errors
			console.error(
				`Error deleting CloudFront distribution ${distributionId}:`,
				error,
			);
			return {
				success: false,
				message: `Error deleting distribution: ${error.message || "Unknown error"}`,
			};
		}
	}
}

export default new DeleteDistributionService();
