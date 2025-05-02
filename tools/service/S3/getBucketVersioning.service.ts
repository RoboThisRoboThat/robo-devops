import { S3Client, GetBucketVersioningCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

class GetBucketVersioningService {
	/**
	 * Gets the versioning configuration for a specified S3 bucket
	 * @param bucketName Name of the S3 bucket to get the versioning configuration for
	 * @param region AWS region where the bucket resides
	 * @param outputFormat Output format (text, json, table)
	 * @returns Promise containing versioning configuration
	 */

	toolName = "get-bucket-versioning";
	description = "Gets the versioning configuration for a specified S3 bucket";

	getBucketVersioningInput = {
		bucketName: z
			.string()
			.describe(
				"The name of the S3 bucket to get the versioning configuration for",
			),
		region: z
			.string()
			.optional()
			.describe("AWS region where the bucket resides"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the output format"),
	};

	getBucketVersioningZodInput = z.object(this.getBucketVersioningInput);

	async getBucketVersioning({
		bucketName,
		region,
		outputFormat = "text",
	}: {
		bucketName: string;
		region?: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create a new S3 client with the region if specified
			const clientConfig = region ? { region } : {};
			const s3Client = new S3Client(clientConfig);

			// Create the command
			const command = new GetBucketVersioningCommand({
				Bucket: bucketName,
			});

			// Send the command
			const response = await s3Client.send(command);

			// Determine versioning status
			let status;
			if (response.Status === "Enabled") {
				status = "Enabled";
			} else if (response.Status === "Suspended") {
				status = "Suspended";
			} else {
				status = "Off";
			}

			// Format based on output format
			return {
				bucketName,
				status,
				mfaDelete: response.MFADelete === "Enabled" ? "Enabled" : "Disabled",
			};
		} catch (error) {
			console.error(
				"Error getting versioning configuration for S3 bucket:",
				error,
			);
			throw error;
		}
	}
}

export default new GetBucketVersioningService();
