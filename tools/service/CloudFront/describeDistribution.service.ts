import {
	CloudFrontClient,
	GetDistributionCommand,
	type Distribution,
} from "@aws-sdk/client-cloudfront";
import { z } from "zod";

class DescribeDistributionService {
	/**
	 * Displays detailed information about a specific CloudFront distribution
	 * @param distributionId ID of the CloudFront distribution to describe
	 * @param outputFormat Optional format for the output (text, json, table)
	 * @returns Promise containing detailed information about the CloudFront distribution
	 */

	toolName = "describe-cloudfront-distribution";
	description =
		"Displays detailed information about a specific CloudFront distribution";

	describeDistributionInput = {
		distributionId: z
			.string()
			.describe(
				"Specifies the ID of the CloudFront distribution to describe (e.g., E1234567890ABCDEF)",
			),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Specifies the output format (text, json, table)"),
	};

	describeDistributionZodInput = z.object(this.describeDistributionInput);

	async describeDistribution({
		distributionId,
		outputFormat = "text",
	}: {
		distributionId: string;
		outputFormat?: "text" | "json" | "table";
	}): Promise<{
		distribution: {
			id: string;
			arn: string;
			status: string;
			domainName: string;
			enabled: boolean;
			origins: Array<{
				id: string;
				domainName: string;
				originPath?: string;
				customHeaders?: Array<{ name: string; value: string }>;
			}>;
			defaultCacheBehavior: {
				targetOriginId: string;
				viewerProtocolPolicy: string;
				allowedMethods: string[];
				cachedMethods: string[];
				compress?: boolean;
				forwardQueryStrings?: boolean;
				forwardHeaders?: string[];
			};
			customErrorResponses?: Array<{
				errorCode: number;
				responsePagePath?: string;
				responseCode?: string;
				errorCachingMinTTL?: number;
			}>;
			priceClass?: string;
			aliases?: string[];
			logging?: {
				enabled: boolean;
				includeCookies: boolean;
				bucket?: string;
				prefix?: string;
			};
			webACLId?: string;
			restrictions?: {
				geoRestriction: {
					restrictionType: string;
					items?: string[];
				};
			};
			viewerCertificate?: {
				cloudFrontDefaultCertificate?: boolean;
				acmCertificateArn?: string;
				sslSupportMethod?: string;
				minimumProtocolVersion?: string;
			};
			eTag?: string;
		};
		rawDistribution?: Distribution;
	}> {
		try {
			const client = new CloudFrontClient({});
			const command = new GetDistributionCommand({
				Id: distributionId,
			});

			const response = await client.send(command);

			if (!response.Distribution) {
				throw new Error(`Distribution with ID ${distributionId} not found`);
			}

			const dist = response.Distribution;
			const distConfig = dist.DistributionConfig;

			if (!distConfig) {
				throw new Error(
					`Distribution configuration for ${distributionId} not found`,
				);
			}

			// Format the response
			const formattedDistribution = {
				id: dist.Id || "",
				arn: dist.ARN || "",
				status: dist.Status || "",
				domainName: dist.DomainName || "",
				enabled: distConfig.Enabled || false,
				origins: (distConfig.Origins?.Items || []).map((origin: any) => ({
					id: origin.Id || "",
					domainName: origin.DomainName || "",
					originPath: origin.OriginPath,
					customHeaders: origin.CustomHeaders?.Items?.map((header: any) => ({
						name: header.HeaderName,
						value: header.HeaderValue,
					})),
				})),
				defaultCacheBehavior: {
					targetOriginId: distConfig.DefaultCacheBehavior?.TargetOriginId || "",
					viewerProtocolPolicy:
						distConfig.DefaultCacheBehavior?.ViewerProtocolPolicy || "",
					allowedMethods:
						distConfig.DefaultCacheBehavior?.AllowedMethods?.Items || [],
					cachedMethods:
						distConfig.DefaultCacheBehavior?.CachedMethods?.Items || [],
					compress: distConfig.DefaultCacheBehavior?.Compress,
					forwardQueryStrings:
						distConfig.DefaultCacheBehavior?.ForwardedValues?.QueryString,
					forwardHeaders:
						distConfig.DefaultCacheBehavior?.ForwardedValues?.Headers?.Items,
				},
				customErrorResponses: distConfig.CustomErrorResponses?.Items?.map(
					(error: any) => ({
						errorCode: error.ErrorCode,
						responsePagePath: error.ResponsePagePath,
						responseCode: error.ResponseCode,
						errorCachingMinTTL: error.ErrorCachingMinTTL,
					}),
				),
				priceClass: distConfig.PriceClass,
				aliases: distConfig.Aliases?.Items,
				logging: {
					enabled: distConfig.Logging?.Enabled || false,
					includeCookies: distConfig.Logging?.IncludeCookies || false,
					bucket: distConfig.Logging?.Bucket,
					prefix: distConfig.Logging?.Prefix,
				},
				webACLId: distConfig.WebACLId,
				restrictions: distConfig.Restrictions
					? {
							geoRestriction: {
								restrictionType:
									distConfig.Restrictions.GeoRestriction?.RestrictionType || "",
								items: distConfig.Restrictions.GeoRestriction?.Items,
							},
						}
					: undefined,
				viewerCertificate: {
					cloudFrontDefaultCertificate:
						distConfig.ViewerCertificate?.CloudFrontDefaultCertificate,
					acmCertificateArn: distConfig.ViewerCertificate?.ACMCertificateArn,
					sslSupportMethod: distConfig.ViewerCertificate?.SSLSupportMethod,
					minimumProtocolVersion:
						distConfig.ViewerCertificate?.MinimumProtocolVersion,
				},
				eTag: response.ETag,
			};

			// If raw output is requested via json format, include it
			if (outputFormat === "json") {
				return {
					distribution: formattedDistribution,
					rawDistribution: response.Distribution,
				};
			}

			return { distribution: formattedDistribution };
		} catch (error) {
			console.error(
				`Error describing CloudFront distribution ${distributionId}:`,
				error,
			);
			throw error;
		}
	}
}

export default new DescribeDistributionService();
