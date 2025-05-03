import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import fs from "node:fs";
import type { Readable } from "node:stream";

class DownloadFileService {
	/**
	 * Downloads an object from a specified S3 bucket to a local file
	 * @param bucketName Name of the S3 bucket to download from
	 * @param key Key of the object to download
	 * @param localFile Path to the local file where the object will be saved
	 * @returns Promise containing download result
	 */

	toolName = "download-file";
	description =
		"Downloads an object from a specified S3 bucket to a local file";

	downloadFileInput = {
		bucketName: z
			.string()
			.describe("The name of the S3 bucket to download from"),
		key: z.string().describe("The key of the object to download"),
		localFile: z
			.string()
			.describe("The path to the local file where the object will be saved"),
	};

	downloadFileZodInput = z.object(this.downloadFileInput);

	async downloadFile({
		bucketName,
		key,
		localFile,
	}: {
		bucketName: string;
		key: string;
		localFile: string;
	}) {
		try {
			// Create a new S3 client
			const s3Client = new S3Client({});

			// Create the command
			const command = new GetObjectCommand({
				Bucket: bucketName,
				Key: key,
			});

			// Send the command
			const response = await s3Client.send(command);

			// Check if the response body is available
			if (!response.Body) {
				throw new Error("Empty response body");
			}

			// Convert body to stream and save to file
			const readableStream = response.Body as Readable;
			const writeStream = fs.createWriteStream(localFile);

			// Create a promise that resolves when the write operation is complete
			const writePromise = new Promise<void>((resolve, reject) => {
				writeStream.on("error", reject);
				writeStream.on("finish", resolve);
			});

			// Pipe the readable stream to the write stream
			readableStream.pipe(writeStream);

			// Wait for the write operation to complete
			await writePromise;

			return {
				success: true,
				bucketName,
				key,
				localFile,
				contentType: response.ContentType,
				contentLength: response.ContentLength,
			};
		} catch (error) {
			console.error("Error downloading file from S3:", error);
			throw error;
		}
	}
}

export default new DownloadFileService();
