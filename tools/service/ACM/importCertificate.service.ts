import { ACMClient, ImportCertificateCommand } from "@aws-sdk/client-acm";
import { z } from "zod";
import fs from "node:fs";
import BaseService from "../base.service";
class ImportCertificateService {
	/**
	 * Imports an existing SSL/TLS certificate into ACM
	 * @param region AWS region in which to import the certificate
	 * @param certificate Certificate body as PEM-encoded string or path to file
	 * @param privateKey Private key as PEM-encoded string or path to file
	 * @param certificateChain Optional certificate chain as PEM-encoded string or path to file
	 * @param tags Optional tags for the imported certificate
	 * @returns Promise containing the ARN of the imported certificate
	 */

	toolName = "import-certificate";
	description = "Imports an existing SSL/TLS certificate into ACM";
	importCertificateInput = {
		region: z
			.string()
			.describe("Specifies the AWS region in which to import the certificate"),
		certificate: z
			.string()
			.describe(
				"The certificate body as a PEM-encoded string or a path to a file containing it",
			),
		privateKey: z
			.string()
			.describe(
				"The private key for the certificate as a PEM-encoded string or a path to a file containing it",
			),
		certificateChain: z
			.string()
			.optional()
			.describe(
				"The certificate chain as a PEM-encoded string or a path to a file containing it",
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
				"A list of key-value pairs to assign as tags to the imported certificate",
			),
	};

	importCertificateZodInput = z.object(this.importCertificateInput);

	async importCertificate({
		region,
		certificate,
		privateKey,
		certificateChain,
		tags,
	}: {
		region: string;
		certificate: string;
		privateKey: string;
		certificateChain?: string;
		tags?: Array<{
			Key: string;
			Value: string;
		}>;
	}) {
		try {
			// Create an ACM client with the specified region
			const acmClient = new ACMClient({ region });

			// Helper function to read content from string or file
			const readContent = (content: string): Buffer => {
				if (fs.existsSync(content)) {
					return fs.readFileSync(content);
				}
				return Buffer.from(content);
			};

			const command = new ImportCertificateCommand({
				Certificate: readContent(certificate),
				PrivateKey: readContent(privateKey),
				CertificateChain: certificateChain
					? readContent(certificateChain)
					: undefined,
				Tags: tags,
			});

			const response = await acmClient.send(command);
			return response;
		} catch (error) {
			console.error(`Error importing certificate in region ${region}:`, error);
			throw error;
		}
	}
}

const importCertificateService = new ImportCertificateService();

export default new BaseService(
	importCertificateService.toolName,
	importCertificateService.description,
	importCertificateService.importCertificateInput,
	importCertificateService.importCertificateZodInput,
	importCertificateService.importCertificate,
);
