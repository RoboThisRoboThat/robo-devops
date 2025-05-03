import { ACMClient, AddTagsToCertificateCommand } from "@aws-sdk/client-acm";
import { z } from "zod";
import BaseService from "../base.service";
class AddTagsToCertificateService {
	/**
	 * Adds one or more tags to an ACM certificate
	 * @param region AWS region where the certificate resides
	 * @param certificateArn ARN of the ACM certificate to add tags to
	 * @param tags List of key-value pairs to add as tags
	 * @returns Promise containing the result
	 */

	toolName = "add-tags-to-certificate";
	description = "Adds one or more tags to an ACM certificate";
	addTagsToCertificateInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the certificate resides"),
		certificateArn: z
			.string()
			.describe("The ARN of the ACM certificate to add tags to"),
		tags: z
			.array(z.string())
			.describe(
				'A list of key-value pairs to add (e.g., --tags "Environment=Production" "Purpose=SSL")',
			),
	};

	addTagsToCertificateZodInput = z.object(this.addTagsToCertificateInput);

	async addTagsToCertificate({
		region,
		certificateArn,
		tags,
	}: {
		region: string;
		certificateArn: string;
		tags: string[];
	}) {
		try {
			// Create an ACM client with the specified region
			const acmClient = new ACMClient({ region });

			// Parse tags from strings like "Key=Value"
			const parsedTags = tags.map((tag) => {
				const [key, value] = tag.split("=");
				if (!key || !value) {
					throw new Error(
						`Invalid tag format: ${tag}. Expected format: "Key=Value"`,
					);
				}
				return { Key: key, Value: value };
			});

			const command = new AddTagsToCertificateCommand({
				CertificateArn: certificateArn,
				Tags: parsedTags,
			});

			const response = await acmClient.send(command);
			return response;
		} catch (error) {
			console.error(
				`Error adding tags to certificate ${certificateArn} in region ${region}:`,
				error,
			);
			throw error;
		}
	}
}

const addTagsToCertificateService = new AddTagsToCertificateService();

export default new BaseService(
	addTagsToCertificateService.toolName,
	addTagsToCertificateService.description,
	addTagsToCertificateService.addTagsToCertificateInput,
	addTagsToCertificateService.addTagsToCertificateZodInput,
	addTagsToCertificateService.addTagsToCertificate,
);
