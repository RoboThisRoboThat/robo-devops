import { ACMClient, DescribeCertificateCommand } from "@aws-sdk/client-acm";
import { z } from "zod";
import BaseService from "../base.service";
class DescribeCertificateService {
	/**
	 * Displays detailed information about a specific ACM certificate
	 * @param region AWS region where the certificate resides
	 * @param certificateArn ARN of the ACM certificate
	 * @param outputFormat Optional format for the output
	 * @returns Promise containing the certificate details
	 */

	toolName = "describe-certificate";
	description =
		"Displays detailed information about a specific ACM certificate";
	describeCertificateInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the certificate resides"),
		certificateArn: z
			.string()
			.describe(
				"Specifies the ARN of the ACM certificate (e.g., arn:aws:acm:us-east-1:123456789012:certificate/abcdef12-3456-7890-abcd-ef1234567890)",
			),
		outputFormat: z
			.enum(["text", "json"])
			.optional()
			.describe("Specifies the output format (text, json)"),
	};

	describeCertificateZodInput = z.object(this.describeCertificateInput);

	async describeCertificate({
		region,
		certificateArn,
		outputFormat = "json",
	}: {
		region: string;
		certificateArn: string;
		outputFormat?: "text" | "json";
	}) {
		try {
			// Create an ACM client with the specified region
			const acmClient = new ACMClient({ region });

			const command = new DescribeCertificateCommand({
				CertificateArn: certificateArn,
			});

			const response = await acmClient.send(command);
			return response.Certificate;
		} catch (error) {
			console.error(
				`Error describing certificate ${certificateArn} in region ${region}:`,
				error,
			);
			throw error;
		}
	}
}

const describeCertificateService = new DescribeCertificateService();

export default new BaseService(
	describeCertificateService.toolName,
	describeCertificateService.description,
	describeCertificateService.describeCertificateInput,
	describeCertificateService.describeCertificateZodInput,
	describeCertificateService.describeCertificate,
);
