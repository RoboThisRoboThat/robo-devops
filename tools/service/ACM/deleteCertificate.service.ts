import { ACMClient, DeleteCertificateCommand } from "@aws-sdk/client-acm";
import { z } from "zod";

class DeleteCertificateService {
	/**
	 * Deletes a specified ACM certificate
	 * @param region AWS region where the certificate resides
	 * @param certificateArn ARN of the ACM certificate to delete
	 * @returns Promise containing the deletion result
	 */

	toolName = "delete-certificate";
	description = "Deletes a specified ACM certificate";
	deleteCertificateInput = {
		region: z
			.string()
			.describe("Specifies the AWS region where the certificate resides"),
		certificateArn: z
			.string()
			.describe("The ARN of the ACM certificate to delete"),
	};

	deleteCertificateZodInput = z.object(this.deleteCertificateInput);

	async deleteCertificate({
		region,
		certificateArn,
	}: {
		region: string;
		certificateArn: string;
	}) {
		try {
			// Create an ACM client with the specified region
			const acmClient = new ACMClient({ region });

			const command = new DeleteCertificateCommand({
				CertificateArn: certificateArn,
			});

			const response = await acmClient.send(command);
			return response;
		} catch (error) {
			console.error(
				`Error deleting certificate ${certificateArn} in region ${region}:`,
				error,
			);
			throw error;
		}
	}
}

export default new DeleteCertificateService();
