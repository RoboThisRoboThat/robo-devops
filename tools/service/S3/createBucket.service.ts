import {
	S3Client,
	CreateBucketCommand,
	CreateBucketCommandInput,
	ObjectLockEnabledForBucket,
	BucketCannedACL,
} from "@aws-sdk/client-s3";
import { z } from "zod";

class CreateBucketService {
	/**
	 * Creates a new S3 bucket with specified configurations
	 * @param bucketName Name of the new S3 bucket
	 * @param region AWS region in which to create the bucket
	 * @param acl Canned access control list
	 * @param grantRead Grant read permissions to specified AWS accounts or groups
	 * @param grantWrite Grant write permissions to specified AWS accounts or groups
	 * @param grantReadAcp Grant read access to the bucket ACL
	 * @param grantWriteAcp Grant write access to the bucket ACL
	 * @param objectLockEnabledForBucket Whether to enable object lock for the bucket
	 * @param tags Tags to assign to the new bucket
	 * @returns Promise containing bucket creation details
	 */

	toolName = "create-bucket";
	description = "Creates a new S3 bucket with specified configurations";

	createBucketInput = {
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

	createBucketZodInput = z.object(this.createBucketInput);

	async createBucket({
		bucketName,
		region,
		acl,
		grantRead,
		grantWrite,
		grantReadAcp,
		grantWriteAcp,
		objectLockEnabledForBucket,
		tags,
	}: {
		bucketName: string;
		region?: string;
		acl?: BucketCannedACL;
		grantRead?: string[];
		grantWrite?: string[];
		grantReadAcp?: string[];
		grantWriteAcp?: string[];
		objectLockEnabledForBucket?: boolean;
		tags?: { Key: string; Value: string }[];
	}) {
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
					LocationConstraint: region,
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
				input.ObjectLockEnabledForBucket =
					objectLockEnabledForBucket as ObjectLockEnabledForBucket;
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

export default new CreateBucketService();
