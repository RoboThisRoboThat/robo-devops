import {
	CloudFrontClient,
	CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { z } from "zod";

class CreateInvalidationService {
	/**
	 * Creates a new invalidation request for a specified CloudFront distribution
	 * @param distributionId ID of the CloudFront distribution
	 * @param paths List of object paths to invalidate
	 * @param callerReference Unique value to prevent duplicate invalidation requests
	 * @returns Promise containing the invalidation details
	 */

	toolName = "create-cloudfront-invalidation";
	description =
		"Creates a new invalidation request for a specified CloudFront distribution to remove objects from edge caches";

	createInvalidationInput = {
		distributionId: z
			.string()
			.describe(
				"Specifies the ID of the CloudFront distribution for which you want to create an invalidation",
			),
		paths: z
			.string()
			.describe(
				"A comma-separated list of the object paths that you want to invalidate. You can use wildcards (*) to invalidate multiple objects (e.g., /images/image1.jpg, /css/*). To invalidate all objects, use /*",
			),
		callerReference: z
			.string()
			.optional()
			.describe(
				"A unique value that prevents the accidental creation of duplicate invalidation requests. If you don't provide one, a timestamp will be used",
			),
	};

	createInvalidationZodInput = z.object(this.createInvalidationInput);

	async createInvalidation({
		distributionId,
		paths,
		callerReference,
	}: {
		distributionId: string;
		paths: string;
		callerReference?: string;
	}): Promise<{
		invalidationId: string;
		status: string;
		createTime?: Date;
		pathsInvalidated: string[];
	}> {
		try {
			// Create CloudFront client
			const client = new CloudFrontClient({});

			// Parse paths string into an array
			const pathsArray = paths.split(",").map((p) => p.trim());

			// Generate a caller reference if not provided
			const ref = callerReference || `invalidation-${Date.now()}`;

			// Create invalidation command
			const command = new CreateInvalidationCommand({
				DistributionId: distributionId,
				InvalidationBatch: {
					Paths: {
						Quantity: pathsArray.length,
						Items: pathsArray,
					},
					CallerReference: ref,
				},
			});

			// Send the command
			const response = await client.send(command);

			// Return the invalidation details
			return {
				invalidationId: response.Invalidation?.Id || "",
				status: response.Invalidation?.Status || "",
				createTime: response.Invalidation?.CreateTime,
				pathsInvalidated: pathsArray,
			};
		} catch (error) {
			console.error(
				`Error creating invalidation for distribution ${distributionId}:`,
				error,
			);
			throw error;
		}
	}
}

export default new CreateInvalidationService();
