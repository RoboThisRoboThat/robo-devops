import {
	ACMClient,
	RemoveTagsFromCertificateCommand,
} from "@aws-sdk/client-acm";
import { z } from "zod";
import BaseService from "../base.service";
class RemoveTagsFromCertificateService {
	/**
	 * Removes one or more tags from an ACM certificate
	 * @param region AWS region where the certificate resides
	 * @param certificateArn ARN of the ACM certificate to remove tags from
	 * @param tagKeys List of tag keys to remove
	 * @returns Promise containing the result
	 */

	toolName = "remove-tags-from-certificate";
	description = "Removes one or more tags from an ACM certificate";
	removeTagsFromCertificateInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the certificate resides"),
		certificateArn: z
			.string()
			.describe("The ARN of the ACM certificate to remove tags from"),
		tagKeys: z
			.array(z.string())
			.describe(
				'A list of tag keys to remove (e.g., --tag-keys "Environment" "Purpose")',
			),
	};

	removeTagsFromCertificateZodInput = z.object(
		this.removeTagsFromCertificateInput,
	);

	async removeTagsFromCertificate({
		region,
		certificateArn,
		tagKeys,
	}: {
		region: string;
		certificateArn: string;
		tagKeys: string[];
	}) {
		try {
			// Create an ACM client with the specified region
			const acmClient = new ACMClient({ region });

			// Convert tag keys to the expected format for removal
			const tags = tagKeys.map((key) => ({ Key: key }));

			const command = new RemoveTagsFromCertificateCommand({
				CertificateArn: certificateArn,
				Tags: tags,
			});

			const response = await acmClient.send(command);
			return response;
		} catch (error) {
			console.error(
				`Error removing tags from certificate ${certificateArn} in region ${region}:`,
				error,
			);
			throw error;
		}
	}
}

const removeTagsFromCertificateService = new RemoveTagsFromCertificateService();

export default new BaseService(
	removeTagsFromCertificateService.toolName,
	removeTagsFromCertificateService.description,
	removeTagsFromCertificateService.removeTagsFromCertificateInput,
	removeTagsFromCertificateService.removeTagsFromCertificateZodInput,
	removeTagsFromCertificateService.removeTagsFromCertificate,
);
