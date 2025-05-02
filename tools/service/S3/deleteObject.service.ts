import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

class DeleteObjectService {
	/**
	 * Deletes a specified object from an S3 bucket
	 * @param bucketName Name of the S3 bucket containing the object
	 * @param key Key of the object to delete
	 * @param versionId If the bucket has versioning enabled, specifies the version of the object to delete
	 * @returns Promise containing deletion result
	 */

	toolName = "delete-object";
	description = "Deletes a specified object from an S3 bucket";

	deleteObjectInput = {
		bucketName: z
			.string()
			.describe("The name of the S3 bucket containing the object"),
		key: z.string().describe("The key of the object to delete"),
		versionId: z
			.string()
			.optional()
			.describe(
				"If the bucket has versioning enabled, specifies the version of the object to delete",
			),
	};

	deleteObjectZodInput = z.object(this.deleteObjectInput);

	async deleteObject({
		bucketName,
		key,
		versionId,
	}: {
		bucketName: string;
		key: string;
		versionId?: string;
	}) {
		try {
			// Create a new S3 client
			const s3Client = new S3Client({});

			// Create the command
			const command = new DeleteObjectCommand({
				Bucket: bucketName,
				Key: key,
				VersionId: versionId,
			});

			// Send the command
			const response = await s3Client.send(command);

			return {
				success: true,
				bucketName,
				key,
				versionId: versionId || null,
				deleteMarker: response.DeleteMarker,
				versionDeleted: response.VersionId || null,
			};
		} catch (error) {
			console.error("Error deleting object from S3:", error);
			throw error;
		}
	}
}

export default new DeleteObjectService();
