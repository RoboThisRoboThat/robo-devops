import { S3Client, DeleteBucketCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import BaseService from "../base.service";

class DeleteBucketService {
	/**
	 * Permanently removes an S3 bucket
	 * Note: The bucket must be empty before it can be deleted
	 * @param bucketName Name of the S3 bucket to delete
	 * @param region AWS region where the bucket resides
	 * @returns Promise containing deletion result
	 */

	toolName = "delete-bucket";
	description = "Deletes a specified S3 bucket (must be empty)";

	deleteBucketInput = {
		bucketName: z.string().describe("The name of the S3 bucket to delete"),
		region: z
			.string()
			.optional()
			.describe("AWS region where the bucket resides"),
	};

	deleteBucketZodInput = z.object(this.deleteBucketInput);

	async deleteBucket(params: Record<string, unknown>) {
		const { bucketName, region } = params as {
			bucketName: string;
			region?: string;
		};

		try {
			// Create a new S3 client with the region if specified
			const clientConfig = region ? { region } : {};
			const s3Client = new S3Client(clientConfig);

			// Create the command
			const command = new DeleteBucketCommand({
				Bucket: bucketName,
			});

			// Send the command
			await s3Client.send(command);

			return {
				success: true,
				message: `Bucket '${bucketName}' deleted successfully`,
			};
		} catch (error) {
			console.error("Error deleting S3 bucket:", error);
			throw error;
		}
	}
}

const deleteBucketService = new DeleteBucketService();

export default new BaseService(
	deleteBucketService.toolName,
	deleteBucketService.description,
	deleteBucketService.deleteBucketInput,
	deleteBucketService.deleteBucketZodInput,
	deleteBucketService.deleteBucket,
);
