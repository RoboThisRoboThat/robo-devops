import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

class ListBucketsService {
	/**
	 * Retrieves and displays a detailed list of S3 buckets
	 * @param outputFormat Optional output format (text, json, table)
	 * @returns Promise containing array of bucket details
	 */

	toolName = "list-buckets";
	description = "Retrieves and displays a detailed list of S3 buckets";

	listBucketsInput = {
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the desired output format"),
	};

	listBucketsZodInput = z.object(this.listBucketsInput);

	async listBuckets({
		outputFormat = "text",
	}: {
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create a new S3 client
			const s3Client = new S3Client({});

			// Create the command
			const command = new ListBucketsCommand({});

			// Send the command
			const response = await s3Client.send(command);

			if (!response.Buckets) {
				return [];
			}

			// Extract bucket information
			const buckets = response.Buckets.map((bucket) => ({
				name: bucket.Name || "",
				creationDate: bucket.CreationDate
					? bucket.CreationDate.toISOString()
					: null,
			}));

			return buckets;
		} catch (error) {
			console.error("Error listing S3 buckets:", error);
			throw error;
		}
	}
}

export default new ListBucketsService();
