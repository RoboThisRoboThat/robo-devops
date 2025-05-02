import {
	S3Client,
	DeleteObjectsCommand,
	ObjectIdentifier,
} from "@aws-sdk/client-s3";
import { z } from "zod";
import fs from "node:fs";

class DeleteObjectsService {
	/**
	 * Deletes multiple objects from a specified S3 bucket in a single request
	 * @param bucketName Name of the S3 bucket containing the objects
	 * @param objects A JSON string or a file path to a JSON file specifying the objects to delete
	 * @returns Promise containing deletion results
	 */

	toolName = "delete-objects";
	description = "Deletes multiple objects from a specified S3 bucket";

	deleteObjectsInput = {
		bucketName: z
			.string()
			.describe("The name of the S3 bucket containing the objects"),
		objects: z
			.string()
			.describe(
				"A JSON string or a file path to a JSON file specifying the objects to delete",
			),
	};

	deleteObjectsZodInput = z.object(this.deleteObjectsInput);

	async deleteObjects({
		bucketName,
		objects,
	}: {
		bucketName: string;
		objects: string;
	}) {
		try {
			// Parse the objects parameter (either JSON string or load from file)
			let objectsToDelete: ObjectIdentifier[];

			if (objects.startsWith("{") || objects.startsWith("[")) {
				// Parse as JSON string
				objectsToDelete = JSON.parse(objects);
			} else {
				// Parse as file path
				const fileContent = fs.readFileSync(objects, "utf8");
				objectsToDelete = JSON.parse(fileContent);
			}

			// Ensure it's an array
			if (!Array.isArray(objectsToDelete)) {
				throw new Error("Objects must be an array");
			}

			// Create a new S3 client
			const s3Client = new S3Client({});

			// Create the command
			const command = new DeleteObjectsCommand({
				Bucket: bucketName,
				Delete: {
					Objects: objectsToDelete,
					Quiet: false,
				},
			});

			// Send the command
			const response = await s3Client.send(command);

			return {
				success: true,
				bucketName,
				deleted: response.Deleted || [],
				errors: response.Errors || [],
			};
		} catch (error) {
			console.error("Error deleting objects from S3:", error);
			throw error;
		}
	}
}

export default new DeleteObjectsService();
