import { S3Client, PutBucketVersioningCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

class DisableVersioningService {
	/**
	 * Suspends versioning for a specified S3 bucket
	 * Existing versions are retained, but new uploads will overwrite the current version
	 * @param bucketName Name of the S3 bucket to suspend versioning for
	 * @param region AWS region where the bucket resides
	 * @returns Promise containing versioning result
	 */

	toolName = "disable-versioning";
	description = "Suspends versioning for a specified S3 bucket";

	disableVersioningInput = {
		bucketName: z
			.string()
			.describe("The name of the S3 bucket to suspend versioning for"),
		region: z
			.string()
			.optional()
			.describe("AWS region where the bucket resides"),
	};

	disableVersioningZodInput = z.object(this.disableVersioningInput);

	async disableVersioning({
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
					Status: "Suspended",
				},
			});

			// Send the command
			await s3Client.send(command);

			return {
				success: true,
				bucketName,
				versioningStatus: "Suspended",
			};
		} catch (error) {
			console.error("Error suspending versioning for S3 bucket:", error);
			throw error;
		}
	}
}

export default new DisableVersioningService();
