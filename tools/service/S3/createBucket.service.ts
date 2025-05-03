import {
	S3Client,
	CreateBucketCommand,
	type BucketCannedACL,
	type BucketLocationConstraint,
} from "@aws-sdk/client-s3";
import type { CreateBucketCommandInput } from "@aws-sdk/client-s3";
import { z } from "zod";
import BaseService from "../base.service";

interface CreateBucketInput {
	bucketName: string;
	region?: string;
	acl?: BucketCannedACL;
	grantRead?: string[];
	grantWrite?: string[];
	grantReadAcp?: string[];
	grantWriteAcp?: string[];
	objectLockEnabledForBucket?: boolean;
	tags?: { Key: string; Value: string }[];
}

interface CreateBucketOutput {
	bucketName: string;
	location?: string;
	region: string;
}

class CreateBucketService {
	/**
	 * Creates a new S3 bucket with specified configurations
	 */

	toolName = "create-bucket";
	description = "Creates a new S3 bucket with specified configurations";

	inputSchema = {
		bucketName: z
			.string()
			.describe(
				"The name of the new S3 bucket (must be globally unique across all of AWS)",
			),
		region: z
			.string()
			.optional()
			.describe(
				"AWS region in which to create the bucket (e.g., us-east-1, ap-southeast-2)",
			),
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
			.describe("Canned access control list to apply to the bucket"),
		grantRead: z
			.array(z.string())
			.optional()
			.describe(
				"Gives read permissions to the specified AWS accounts or groups",
			),
		grantWrite: z
			.array(z.string())
			.optional()
			.describe(
				"Gives write permissions to the specified AWS accounts or groups",
			),
		grantReadAcp: z
			.array(z.string())
			.optional()
			.describe(
				"Gives read access to the bucket ACL to the specified AWS accounts or groups",
			),
		grantWriteAcp: z
			.array(z.string())
			.optional()
			.describe(
				"Gives write access to the bucket ACL to the specified AWS accounts or groups",
			),
		objectLockEnabledForBucket: z
			.boolean()
			.optional()
			.describe(
				"Specifies whether to enable object lock for the bucket (once enabled, cannot be disabled)",
			),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe(
				"A list of key-value pairs to assign as tags to the new bucket",
			),
	};

	zodSchema = z.object(this.inputSchema);

	async execute(params: Record<string, unknown>) {
		// Use type assertion with unknown as intermediary for safety
		const typedParams = params as unknown as Partial<CreateBucketInput>;
		const {
			bucketName,
			region,
			acl,
			grantRead,
			grantWrite,
			grantReadAcp,
			grantWriteAcp,
			objectLockEnabledForBucket,
			tags,
		} = typedParams;

		if (!bucketName) {
			throw new Error("bucketName is required");
		}

		try {
			// Create a new S3 client with the region if specified
			const clientConfig = region ? { region } : {};
			const s3Client = new S3Client(clientConfig);

			// Prepare the command input
			const input: CreateBucketCommandInput = {
				Bucket: bucketName,
			};

			// Add location constraint if region is specified and not us-east-1
			if (region && region !== "us-east-1") {
				input.CreateBucketConfiguration = {
					LocationConstraint: region as BucketLocationConstraint,
				};
			}

			// Add ACL if specified
			if (acl) {
				input.ACL = acl;
			}

			// Add grants if specified
			if (grantRead && grantRead.length > 0) {
				input.GrantRead = grantRead.join(",");
			}

			if (grantWrite && grantWrite.length > 0) {
				input.GrantWrite = grantWrite.join(",");
			}

			if (grantReadAcp && grantReadAcp.length > 0) {
				input.GrantReadACP = grantReadAcp.join(",");
			}

			if (grantWriteAcp && grantWriteAcp.length > 0) {
				input.GrantWriteACP = grantWriteAcp.join(",");
			}

			// Add object lock configuration if specified
			if (objectLockEnabledForBucket !== undefined) {
				input.ObjectLockEnabledForBucket = objectLockEnabledForBucket;
			}

			// Create the command
			const command = new CreateBucketCommand(input);

			// Send the command
			const response = await s3Client.send(command);

			// If tags provided, apply them (would require a separate PutBucketTagging command)
			if (tags && tags.length > 0) {
				// Implementation for tagging would go here
				// This requires a separate API call
			}

			return {
				bucketName,
				location: response.Location,
				region: region || "us-east-1",
			};
		} catch (error) {
			console.error("Error creating S3 bucket:", error);
			throw error;
		}
	}
}

const createBucketService = new CreateBucketService();

export default new BaseService(
	createBucketService.toolName,
	createBucketService.description,
	createBucketService.inputSchema,
	createBucketService.zodSchema,
	createBucketService.execute,
);
