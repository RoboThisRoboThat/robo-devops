import {
	S3Client,
	PutObjectCommand,
	ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { z } from "zod";
import fs from "fs";
import BaseService from "../base.service";

class UploadFileService {
	/**
	 * Uploads a local file to a specified S3 bucket
	 * @param localFile Path to the local file to upload
	 * @param bucketName Name of the S3 bucket to upload to
	 * @param key Key under which the file will be stored in the S3 bucket
	 * @param acl Canned ACL to apply to the uploaded object
	 * @param grantRead Gives read permissions to specified AWS accounts or groups
	 * @param grantFullControl Gives full control permissions to specified AWS accounts or groups
	 * @param contentType MIME type of the content being uploaded
	 * @param metadata Custom metadata to be stored with the object
	 * @param tags Tags to assign to the uploaded object
	 * @returns Promise containing upload result
	 */

	toolName = "upload-file";
	description = "Uploads a local file to a specified S3 bucket";

	uploadFileInput = {
		localFile: z.string().describe("The path to the local file to upload"),
		bucketName: z.string().describe("The name of the S3 bucket to upload to"),
		key: z
			.string()
			.describe("The key under which the file will be stored in the S3 bucket"),
		acl: z
			.enum([
				"private",
				"public-read",
				"public-read-write",
				"authenticated-read",
				"aws-exec-read",
				"bucket-owner-read",
				"bucket-owner-full-control",
			])
			.optional()
			.describe("Specifies the canned ACL to apply to the uploaded object"),
		grantRead: z
			.array(z.string())
			.optional()
			.describe(
				"Gives read permissions to the specified AWS accounts or groups for the object",
			),
		grantFullControl: z
			.array(z.string())
			.optional()
			.describe(
				"Gives full control permissions to the specified AWS accounts or groups for the object",
			),
		contentType: z
			.string()
			.optional()
			.describe("The MIME type of the content being uploaded"),
		metadata: z
			.record(z.string())
			.optional()
			.describe(
				"Custom metadata to be stored with the object as key-value pairs",
			),
		tags: z
			.array(
				z.object({
					Key: z.string(),
					Value: z.string(),
				}),
			)
			.optional()
			.describe(
				"A list of key-value pairs to assign as tags to the uploaded object",
			),
	};

	uploadFileZodInput = z.object(this.uploadFileInput);

	async uploadFile({
		localFile,
		bucketName,
		key,
		acl,
		grantRead,
		grantFullControl,
		contentType,
		metadata,
		tags,
	}: {
		localFile: string;
		bucketName: string;
		key: string;
		acl?: ObjectCannedACL;
		grantRead?: string[];
		grantFullControl?: string[];
		contentType?: string;
		metadata?: Record<string, string>;
		tags?: { Key: string; Value: string }[];
	}) {
		try {
			// Read the file from the local file system
			const fileContent = fs.readFileSync(localFile);

			// Create a new S3 client
			const s3Client = new S3Client({});

			// Prepare the tagging string if tags are provided
			let tagging: string | undefined;
			if (tags && tags.length > 0) {
				tagging = tags
					.map(
						(tag) =>
							`${encodeURIComponent(tag.Key)}=${encodeURIComponent(tag.Value)}`,
					)
					.join("&");
			}

			// Create the command with the parameters
			const command = new PutObjectCommand({
				Bucket: bucketName,
				Key: key,
				Body: fileContent,
				ACL: acl,
				GrantRead: grantRead?.join(","),
				GrantFullControl: grantFullControl?.join(","),
				ContentType: contentType,
				Metadata: metadata,
				Tagging: tagging,
			});

			// Send the command
			const response = await s3Client.send(command);

			return {
				etag: response.ETag,
				bucketName,
				key,
				size: fileContent.length,
			};
		} catch (error) {
			console.error("Error uploading file to S3:", error);
			throw error;
		}
	}
}

const uploadFileService = new UploadFileService();

export default new BaseService(
	uploadFileService.toolName,
	uploadFileService.description,
	uploadFileService.uploadFileInput,
	uploadFileService.uploadFileZodInput,
	uploadFileService.uploadFile,
);
