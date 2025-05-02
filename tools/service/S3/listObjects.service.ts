import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { z } from "zod";

class ListObjectsService {
	/**
	 * Lists objects in a specified S3 bucket
	 * @param bucketName Name of the S3 bucket to list objects from
	 * @param prefix Limits results to objects with keys that begin with the specified prefix
	 * @param delimiter Character used to group keys
	 * @param maxItems Maximum number of keys to return
	 * @param startingToken Token to specify where to continue paginated results
	 * @param outputFormat Output format (text, json, table)
	 * @returns Promise containing list of objects
	 */

	toolName = "list-objects";
	description = "Lists objects in a specified S3 bucket";

	listObjectsInput = {
		bucketName: z
			.string()
			.describe("The name of the S3 bucket to list objects from"),
		prefix: z
			.string()
			.optional()
			.describe(
				"Limits the results to objects with keys that begin with the specified prefix",
			),
		delimiter: z.string().optional().describe("A character used to group keys"),
		maxItems: z
			.number()
			.optional()
			.describe("The maximum number of keys to return in the response"),
		startingToken: z
			.string()
			.optional()
			.describe("A token to specify where to continue paginated results"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the output format"),
	};

	listObjectsZodInput = z.object(this.listObjectsInput);

	async listObjects({
		bucketName,
		prefix,
		delimiter,
		maxItems,
		startingToken,
		outputFormat = "text",
	}: {
		bucketName: string;
		prefix?: string;
		delimiter?: string;
		maxItems?: number;
		startingToken?: string;
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create a new S3 client
			const s3Client = new S3Client({});

			// Create the command with the parameters
			const command = new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: prefix,
				Delimiter: delimiter,
				MaxKeys: maxItems,
				ContinuationToken: startingToken,
			});

			// Send the command
			const response = await s3Client.send(command);

			// Format and return the response
			const result = {
				objects:
					response.Contents?.map((item) => ({
						key: item.Key || "",
						size: item.Size || 0,
						lastModified: item.LastModified
							? item.LastModified.toISOString()
							: null,
						etag: item.ETag || "",
						storageClass: item.StorageClass || "",
					})) || [],
				commonPrefixes:
					response.CommonPrefixes?.map((prefix) => prefix.Prefix || "") || [],
				isTruncated: response.IsTruncated || false,
				nextContinuationToken: response.NextContinuationToken || null,
				keyCount: response.KeyCount || 0,
			};

			return result;
		} catch (error) {
			console.error("Error listing S3 objects:", error);
			throw error;
		}
	}
}

export default new ListObjectsService();
