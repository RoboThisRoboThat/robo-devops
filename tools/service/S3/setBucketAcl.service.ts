import {
	S3Client,
	PutBucketAclCommand,
	BucketCannedACL,
} from "@aws-sdk/client-s3";
import { z } from "zod";
import fs from "node:fs";
import BaseService from "../base.service";

class SetBucketAclService {
	/**
	 * Sets the access control list (ACL) for a specified S3 bucket
	 * @param bucketName Name of the S3 bucket to set the ACL for
	 * @param region AWS region where the bucket resides
	 * @param acl Canned ACL to apply
	 * @param grantRead Gives read permissions to the specified AWS accounts or groups
	 * @param grantWrite Gives write permissions to the specified AWS accounts or groups
	 * @param grantReadAcp Gives read access to the bucket ACL
	 * @param grantWriteAcp Gives write access to the bucket ACL
	 * @param accessControlPolicy Specifies the ACL as an XML file
	 * @returns Promise containing ACL update result
	 */

	toolName = "set-bucket-acl";
	description = "Sets the access control list (ACL) for a specified S3 bucket";

	setBucketAclInput = {
		bucketName: z
			.string()
			.describe("The name of the S3 bucket to set the ACL for"),
		region: z
			.string()
			.optional()
			.describe("AWS region where the bucket resides"),
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
			.describe("Specifies a canned ACL to apply"),
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
			.describe("Gives read access to the bucket ACL"),
		grantWriteAcp: z
			.array(z.string())
			.optional()
			.describe("Gives write access to the bucket ACL"),
		accessControlPolicy: z
			.string()
			.optional()
			.describe("Specifies the ACL as an XML file"),
	};

	setBucketAclZodInput = z.object(this.setBucketAclInput);

	async setBucketAcl({
		bucketName,
		region,
		acl,
		grantRead,
		grantWrite,
		grantReadAcp,
		grantWriteAcp,
		accessControlPolicy,
	}: {
		bucketName: string;
		region?: string;
		acl?: BucketCannedACL;
		grantRead?: string[];
		grantWrite?: string[];
		grantReadAcp?: string[];
		grantWriteAcp?: string[];
		accessControlPolicy?: string;
	}) {
		try {
			// Create a new S3 client with the region if specified
			const clientConfig = region ? { region } : {};
			const s3Client = new S3Client(clientConfig);

			// Prepare command options
			const commandInput: any = {
				Bucket: bucketName,
			};

			// Add ACL option if specified
			if (acl) {
				commandInput.ACL = acl;
			}

			// Add grant options if specified
			if (grantRead && grantRead.length > 0) {
				commandInput.GrantRead = grantRead.join(",");
			}

			if (grantWrite && grantWrite.length > 0) {
				commandInput.GrantWrite = grantWrite.join(",");
			}

			if (grantReadAcp && grantReadAcp.length > 0) {
				commandInput.GrantReadACP = grantReadAcp.join(",");
			}

			if (grantWriteAcp && grantWriteAcp.length > 0) {
				commandInput.GrantWriteACP = grantWriteAcp.join(",");
			}

			// Add AccessControlPolicy if XML file is provided
			if (accessControlPolicy) {
				// Check if it's a file path
				if (accessControlPolicy.endsWith(".xml")) {
					const xmlContent = fs.readFileSync(accessControlPolicy, "utf-8");
					// In a real implementation, we would parse the XML and set the AccessControlPolicy
					// For now, we'll throw an error
					throw new Error("XML parsing not implemented");
				} else {
					// Assume it's an XML string
					// In a real implementation, we would parse the XML and set the AccessControlPolicy
					throw new Error("XML parsing not implemented");
				}
			}

			// Create the command
			const command = new PutBucketAclCommand(commandInput);

			// Send the command
			await s3Client.send(command);

			return {
				success: true,
				bucketName,
				message: "ACL applied successfully",
			};
		} catch (error) {
			console.error("Error setting ACL for S3 bucket:", error);
			throw error;
		}
	}
}

const setBucketAclService = new SetBucketAclService();

export default new BaseService(
	setBucketAclService.toolName,
	setBucketAclService.description,
	setBucketAclService.setBucketAclInput,
	setBucketAclService.setBucketAclZodInput,
	setBucketAclService.setBucketAcl,
);
