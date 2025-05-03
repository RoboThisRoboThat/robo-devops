import {
	CloudFrontClient,
	GetInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { z } from "zod";
import BaseService from "../base.service";

class GetInvalidationService {
	/**
	 * Retrieves the status of a specific invalidation request
	 * @param distributionId ID of the CloudFront distribution
	 * @param invalidationId ID of the invalidation request
	 * @returns Promise containing the invalidation details and status
	 */

	toolName = "get-cloudfront-invalidation";
	description =
		"Retrieves the status of a specific CloudFront invalidation request";

	getInvalidationInput = {
		distributionId: z
			.string()
			.describe("Specifies the ID of the CloudFront distribution"),
		invalidationId: z
			.string()
			.describe(
				"Specifies the ID of the invalidation request to get the status for",
			),
	};

	getInvalidationZodInput = z.object(this.getInvalidationInput);

	async getInvalidation(params: Record<string, unknown>): Promise<{
		status: string;
		createTime?: Date;
		paths: string[];
		callerReference: string;
	}> {
		const { distributionId, invalidationId } = params as {
			distributionId: string;
			invalidationId: string;
		};

		try {
			// Create CloudFront client
			const client = new CloudFrontClient({});

			// Create get invalidation command
			const command = new GetInvalidationCommand({
				DistributionId: distributionId,
				Id: invalidationId,
			});

			// Send the command
			const response = await client.send(command);

			if (!response.Invalidation) {
				throw new Error(
					`Invalidation ${invalidationId} not found for distribution ${distributionId}`,
				);
			}

			// Return the invalidation details
			return {
				status: response.Invalidation.Status || "Unknown",
				createTime: response.Invalidation.CreateTime,
				paths: response.Invalidation.InvalidationBatch?.Paths?.Items || [],
				callerReference:
					response.Invalidation.InvalidationBatch?.CallerReference || "",
			};
		} catch (error) {
			console.error(
				`Error getting invalidation ${invalidationId} for distribution ${distributionId}:`,
				error,
			);
			throw error;
		}
	}
}

const getInvalidationService = new GetInvalidationService();

export default new BaseService(
	getInvalidationService.toolName,
	getInvalidationService.description,
	getInvalidationService.getInvalidationInput,
	getInvalidationService.getInvalidationZodInput,
	getInvalidationService.getInvalidation.bind(getInvalidationService),
);
