import { S3Client, PutBucketVersioningCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

class EnableVersioningService {
	/**
	 * Enables versioning for a specified S3 bucket
	 * @param bucketName Name of the S3 bucket to enable versioning for
	 * @param region AWS region where the bucket resides
	 * @returns Promise containing versioning result
	 */

	toolName = "enable-versioning";
	description = "Enables versioning for a specified S3 bucket";

	enableVersioningInput = {
		bucketName: z
			.string()
			.describe("The name of the S3 bucket to enable versioning for"),
		region: z
			.string()
			.optional()
			.describe("AWS region where the bucket resides"),
	};

	enableVersioningZodInput = z.object(this.enableVersioningInput);

	async enableVersioning({
		bucketName,
		region,
	}: {
		bucketName: string;
		region?: string;
	}) {
		try {
			// Create a new S3 client with the region if specified
			const clientConfig = region ? { region } : {};
			const s3Client = new S3Client(clientConfig);

			// Create the command
			const command = new PutBucketVersioningCommand({
				Bucket: bucketName,
				VersioningConfiguration: {
					Status: "Enabled",
				},
			});

			// Send the command
			await s3Client.send(command);

			return {
				success: true,
				bucketName,
				versioningStatus: "Enabled",
			};
		} catch (error) {
			console.error("Error enabling versioning for S3 bucket:", error);
			throw error;
		}
	}
}

export default new EnableVersioningService();
