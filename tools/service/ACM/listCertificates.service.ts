import {
	ACMClient,
	ListCertificatesCommand,
	type CertificateSummary,
} from "@aws-sdk/client-acm";
import { z } from "zod";

class ListCertificatesService {
	/**
	 * Retrieves a list of ACM certificates
	 * @param region AWS region to query
	 * @param certificateStatuses Optional list of certificate statuses to filter by
	 * @param includes Optional includes parameter
	 * @param outputFormat Optional format for the output
	 * @returns Promise containing array of certificate summaries
	 */

	toolName = "list-certificates";
	description = "Retrieves a list of ACM certificates";
	listCertificatesInput = {
		region: z
			.string()
			.describe("Specifies the AWS region to query (e.g., us-east-1)"),
		certificateStatuses: z
			.array(z.string())
			.optional()
			.describe(
				"A list of certificate statuses to filter by (e.g., ISSUED, PENDING_VALIDATION)",
			),
		includes: z
			.object({
				keyTypes: z.array(z.string()).optional(),
				extendedKeyUsage: z.array(z.string()).optional(),
				keyUsage: z.array(z.string()).optional(),
			})
			.optional()
			.describe(
				"Specifies whether to include certificate details such as key algorithm or extended key usage",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the desired output format (text, json, table)"),
	};

	listCertificatesZodInput = z.object(this.listCertificatesInput);

	async listCertificates({
		region,
		certificateStatuses,
		includes,
		outputFormat = "json",
	}: {
		region: string;
		certificateStatuses?: string[];
		includes?: {
			keyTypes?: string[];
			extendedKeyUsage?: string[];
			keyUsage?: string[];
		};
		outputFormat?: "text" | "json" | "table";
	}): Promise<CertificateSummary[]> {
		try {
			// Create an ACM client with the specified region
			const acmClient = new ACMClient({ region });

			const command = new ListCertificatesCommand({
				CertificateStatuses: certificateStatuses,
				Includes: includes,
			});

			const response = await acmClient.send(command);
			return response.CertificateSummaryList || [];
		} catch (error) {
			console.error(`Error listing certificates in region ${region}:`, error);
			throw error;
		}
	}
}

export default new ListCertificatesService();
