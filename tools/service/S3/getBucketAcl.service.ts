import { S3Client, GetBucketAclCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

class GetBucketAclService {
	/**
	 * Gets the access control list (ACL) for a specified S3 bucket
	 * @param bucketName Name of the S3 bucket to get the ACL for
	 * @param region AWS region where the bucket resides
	 * @param outputFormat Output format (text, json)
	 * @returns Promise containing ACL information
	 */

	toolName = "get-bucket-acl";
	description = "Gets the access control list (ACL) for a specified S3 bucket";

	getBucketAclInput = {
		bucketName: z
			.string()
			.describe("The name of the S3 bucket to get the ACL for"),
		region: z
			.string()
			.optional()
			.describe("AWS region where the bucket resides"),
		outputFormat: z
			.enum(["text", "json"])
			.optional()
			.describe("Specifies the output format"),
	};

	getBucketAclZodInput = z.object(this.getBucketAclInput);

	async getBucketAcl({
		bucketName,
		region,
		outputFormat = "text",
	}: {
		bucketName: string;
		region?: string;
		outputFormat?: "text" | "json";
	}) {
		try {
			// Create a new S3 client with the region if specified
			const clientConfig = region ? { region } : {};
			const s3Client = new S3Client(clientConfig);

			// Create the command
			const command = new GetBucketAclCommand({
				Bucket: bucketName,
			});

			// Send the command
			const response = await s3Client.send(command);

			// Extract and format the grants information
			const grants =
				response.Grants?.map((grant) => {
					const grantee = grant.Grantee || {};

					return {
						granteeType: grantee.Type,
						granteeId: grantee.ID,
						granteeDisplayName: grantee.DisplayName,
						granteeUri: grantee.URI,
						permission: grant.Permission,
					};
				}) || [];

			return {
				owner: {
					id: response.Owner?.ID,
					displayName: response.Owner?.DisplayName,
				},
				grants,
			};
		} catch (error) {
			console.error("Error getting ACL for S3 bucket:", error);
			throw error;
		}
	}
}

export default new GetBucketAclService();
