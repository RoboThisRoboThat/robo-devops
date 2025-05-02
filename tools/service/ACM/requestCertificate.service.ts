import { ACMClient, RequestCertificateCommand } from "@aws-sdk/client-acm";
import { z } from "zod";

class RequestCertificateService {
	/**
	 * Requests a new SSL/TLS certificate from ACM
	 * @param region AWS region in which to request the certificate
	 * @param domainName The fully qualified domain name for the certificate
	 * @param validationMethod Method for domain validation
	 * @param subjectAlternativeNames Optional list of additional FQDNs for the certificate
	 * @param idempotencyToken Optional unique identifier for request idempotency
	 * @param domainValidationOptions Optional domain validation options
	 * @param certificateAuthorityArn Optional ARN of the private CA to use
	 * @param options Optional certificate options
	 * @param tags Optional tags for the certificate
	 * @returns Promise containing the ARN of the requested certificate
	 */

	toolName = "request-certificate";
	description = "Requests a new SSL/TLS certificate from ACM";
	requestCertificateInput = {
		region: z
			.string()
			.describe("Specifies the AWS region in which to request the certificate"),
		domainName: z
			.string()
			.describe(
				"The fully qualified domain name (FQDN) for the certificate (e.g., example.com)",
			),
		validationMethod: z
			.enum(["DNS", "EMAIL"])
			.optional()
			.default("DNS")
			.describe(
				"The method ACM uses to validate that you own or control the domain. Allowed values: DNS, EMAIL",
			),
		subjectAlternativeNames: z
			.array(z.string())
			.optional()
			.describe("A list of additional FQDNs to be included in the certificate"),
		idempotencyToken: z
			.string()
			.optional()
			.describe(
				"A unique identifier that you provide to ensure idempotency of the request",
			),
		domainValidationOptions: z
			.array(
				z.object({
					DomainName: z.string(),
					ValidationDomain: z.string(),
				}),
			)
			.optional()
			.describe(
				"A list of domain validation options. Required for certain scenarios with DNS validation",
			),
		certificateAuthorityArn: z
			.string()
			.optional()
			.describe(
				"The ARN of the private certificate authority (CA) to use. Required for private certificates",
			),
		options: z
			.object({
				CertificateTransparencyLoggingPreference: z
					.enum(["ENABLED", "DISABLED"])
					.optional(),
			})
			.optional()
			.describe("Options to specify when requesting a certificate"),
		tags: z
			.array(
				z.object({
					Key: z.string(),
					Value: z.string(),
				}),
			)
			.optional()
			.describe(
				"A list of key-value pairs to assign as tags to the new certificate",
			),
	};

	requestCertificateZodInput = z.object(this.requestCertificateInput);

	async requestCertificate({
		region,
		domainName,
		validationMethod = "DNS",
		subjectAlternativeNames,
		idempotencyToken,
		domainValidationOptions,
		certificateAuthorityArn,
		options,
		tags,
	}: {
		region: string;
		domainName: string;
		validationMethod?: "DNS" | "EMAIL";
		subjectAlternativeNames?: string[];
		idempotencyToken?: string;
		domainValidationOptions?: Array<{
			DomainName: string;
			ValidationDomain: string;
		}>;
		certificateAuthorityArn?: string;
		options?: {
			CertificateTransparencyLoggingPreference?: "ENABLED" | "DISABLED";
		};
		tags?: Array<{
			Key: string;
			Value: string;
		}>;
	}) {
		try {
			// Create an ACM client with the specified region
			const acmClient = new ACMClient({ region });

			const command = new RequestCertificateCommand({
				DomainName: domainName,
				ValidationMethod: validationMethod,
				SubjectAlternativeNames: subjectAlternativeNames,
				IdempotencyToken: idempotencyToken,
				DomainValidationOptions: domainValidationOptions,
				CertificateAuthorityArn: certificateAuthorityArn,
				Options: options,
				Tags: tags,
			});

			const response = await acmClient.send(command);
			return response;
		} catch (error) {
			console.error(
				`Error requesting certificate for ${domainName} in region ${region}:`,
				error,
			);
			throw error;
		}
	}
}

export default new RequestCertificateService();
