import {
	CloudFrontClient,
	GetDistributionConfigCommand,
	UpdateDistributionCommand,
	type DistributionConfig,
	type GetDistributionConfigCommandOutput,
} from "@aws-sdk/client-cloudfront";
import { z } from "zod";
import BaseService from "../base.service";

class UpdateDistributionService {
	/**
	 * Updates the configuration of an existing CloudFront distribution
	 * @param distributionId ID of the CloudFront distribution to update
	 * @param ifMatch The current ETag value for the distribution (required for conditional updates)
	 * @param originDomain New origin domain name
	 * @param originPath New origin path
	 * @param viewerProtocolPolicy New viewer protocol policy
	 * @param allowedHttpMethods New allowed HTTP methods
	 * @param cachedMethods New cached HTTP methods
	 * @param forwardQueryString New setting for forwarding query strings
	 * @param forwardedHeaders New list of forwarded headers
	 * @param compress New compression setting
	 * @param priceClass New price class
	 * @param viewerCertificateMinimumProtocolVersion New minimum SSL/TLS protocol
	 * @param viewerCertificateCloudFrontDefaultCertificate New setting for using the default certificate
	 * @param viewerCertificateAcmCertificateArn New ACM certificate ARN
	 * @param viewerCertificateSslSupportMethod New SSL support method
	 * @param loggingEnabled New logging enabled setting
	 * @param loggingBucket New logging bucket
	 * @param loggingPrefix New logging prefix
	 * @param enabled New enabled setting
	 * @param aliases New list of CNAME aliases
	 * @param defaultRootObject New default root object
	 * @param errorPages New JSON string for custom error responses
	 * @param restrictionsGeoRestrictionType New geo restriction type
	 * @param restrictionsGeoRestrictionLocations New list of geo restriction locations
	 * @param webAclId New web ACL ID
	 * @returns Promise containing the result of the update operation
	 */

	toolName = "update-cloudfront-distribution";
	description =
		"Updates the configuration of an existing CloudFront distribution";

	updateDistributionInput = {
		distributionId: z
			.string()
			.describe("Specifies the ID of the CloudFront distribution to update"),
		ifMatch: z
			.string()
			.describe(
				"The current ETag value for the distribution. This is crucial for performing conditional updates and preventing unintended overwrites",
			),
		originDomain: z.string().optional().describe("The new origin domain name"),
		originPath: z.string().optional().describe("The new origin path"),
		viewerProtocolPolicy: z
			.enum(["allow-all", "https-only", "redirect-to-https"])
			.optional()
			.describe("The new viewer protocol policy"),
		allowedHttpMethods: z
			.string()
			.optional()
			.describe(
				"The new allowed HTTP methods. Specify as a comma-separated list",
			),
		cachedMethods: z
			.string()
			.optional()
			.describe(
				"The new cached HTTP methods. Specify as a comma-separated list",
			),
		forwardQueryString: z
			.boolean()
			.optional()
			.describe("The new setting for forwarding query strings"),
		forwardedHeaders: z
			.string()
			.optional()
			.describe(
				"The new list of forwarded headers. Specify as a comma-separated list",
			),
		compress: z.boolean().optional().describe("The new compression setting"),
		priceClass: z
			.enum(["PriceClass_100", "PriceClass_200", "PriceClass_All"])
			.optional()
			.describe("The new price class"),
		viewerCertificateMinimumProtocolVersion: z
			.string()
			.optional()
			.describe("The new minimum SSL/TLS protocol"),
		viewerCertificateCloudFrontDefaultCertificate: z
			.boolean()
			.optional()
			.describe("The new setting for using the default certificate"),
		viewerCertificateAcmCertificateArn: z
			.string()
			.optional()
			.describe("The new ACM certificate ARN"),
		viewerCertificateSslSupportMethod: z
			.enum(["sni-only", "vip", "static-ip"])
			.optional()
			.describe("The new SSL support method"),
		loggingEnabled: z
			.boolean()
			.optional()
			.describe("The new logging enabled setting"),
		loggingBucket: z.string().optional().describe("The new logging bucket"),
		loggingPrefix: z.string().optional().describe("The new logging prefix"),
		enabled: z.boolean().optional().describe("The new enabled setting"),
		aliases: z
			.string()
			.optional()
			.describe(
				"The new list of CNAME aliases. Specify as a comma-separated list",
			),
		defaultRootObject: z
			.string()
			.optional()
			.describe("The new default root object"),
		errorPages: z
			.string()
			.optional()
			.describe("The new JSON string for custom error responses"),
		restrictionsGeoRestrictionType: z
			.enum(["blacklist", "whitelist", "none"])
			.optional()
			.describe("The new geo restriction type"),
		restrictionsGeoRestrictionLocations: z
			.string()
			.optional()
			.describe(
				"The new list of geo restriction locations. Specify as a comma-separated list",
			),
		webAclId: z.string().optional().describe("The new web ACL ID"),
	};

	updateDistributionZodInput = z.object(this.updateDistributionInput);

	async updateDistribution(params: Record<string, unknown>): Promise<{
		distributionId: string;
		domainName: string;
		etag: string;
		status: string;
	}> {
		const {
			distributionId,
			ifMatch,
			originDomain,
			originPath,
			viewerProtocolPolicy,
			allowedHttpMethods,
			cachedMethods,
			forwardQueryString,
			forwardedHeaders,
			compress,
			priceClass,
			viewerCertificateMinimumProtocolVersion,
			viewerCertificateCloudFrontDefaultCertificate,
			viewerCertificateAcmCertificateArn,
			viewerCertificateSslSupportMethod,
			loggingEnabled,
			loggingBucket,
			loggingPrefix,
			enabled,
			aliases,
			defaultRootObject,
			errorPages,
			restrictionsGeoRestrictionType,
			restrictionsGeoRestrictionLocations,
			webAclId,
		} = params as {
			distributionId: string;
			ifMatch: string;
			originDomain?: string;
			originPath?: string;
			viewerProtocolPolicy?: "allow-all" | "https-only" | "redirect-to-https";
			allowedHttpMethods?: string;
			cachedMethods?: string;
			forwardQueryString?: boolean;
			forwardedHeaders?: string;
			compress?: boolean;
			priceClass?: "PriceClass_100" | "PriceClass_200" | "PriceClass_All";
			viewerCertificateMinimumProtocolVersion?: string;
			viewerCertificateCloudFrontDefaultCertificate?: boolean;
			viewerCertificateAcmCertificateArn?: string;
			viewerCertificateSslSupportMethod?: "sni-only" | "vip" | "static-ip";
			loggingEnabled?: boolean;
			loggingBucket?: string;
			loggingPrefix?: string;
			enabled?: boolean;
			aliases?: string;
			defaultRootObject?: string;
			errorPages?: string;
			restrictionsGeoRestrictionType?: "blacklist" | "whitelist" | "none";
			restrictionsGeoRestrictionLocations?: string;
			webAclId?: string;
		};

		try {
			// Create CloudFront client
			const client = new CloudFrontClient({});

			// First, get the current distribution configuration
			const getConfigCommand = new GetDistributionConfigCommand({
				Id: distributionId,
			});

			const configResponse: GetDistributionConfigCommandOutput =
				await client.send(getConfigCommand);

			if (!configResponse.DistributionConfig || !configResponse.ETag) {
				throw new Error(
					`Distribution configuration for ${distributionId} not found`,
				);
			}

			// Use the provided ETag instead of the one from the response
			// This ensures we're updating the version the user intended
			if (configResponse.ETag !== ifMatch) {
				console.warn(
					`Warning: Provided ETag (${ifMatch}) doesn't match current ETag (${configResponse.ETag}). Using provided ETag anyway.`,
				);
			}

			// Make a copy of the current configuration to modify
			const distributionConfig: DistributionConfig = {
				...configResponse.DistributionConfig,
			};

			// Update the configuration with the provided values
			// Origin updates
			if (
				distributionConfig.Origins &&
				distributionConfig.Origins.Items &&
				distributionConfig.Origins.Items.length > 0
			) {
				// Update the first origin (assuming it's the one we want to modify)
				if (originDomain) {
					distributionConfig.Origins.Items[0].DomainName = originDomain;
				}

				if (originPath !== undefined) {
					distributionConfig.Origins.Items[0].OriginPath = originPath;
				}
			}

			// Default cache behavior updates
			if (distributionConfig.DefaultCacheBehavior) {
				// Update viewer protocol policy
				if (viewerProtocolPolicy) {
					distributionConfig.DefaultCacheBehavior.ViewerProtocolPolicy =
						viewerProtocolPolicy.toUpperCase();
				}

				// Update allowed methods
				if (
					allowedHttpMethods &&
					distributionConfig.DefaultCacheBehavior.AllowedMethods
				) {
					const allowedMethodsArray = allowedHttpMethods
						.split(",")
						.map((m) => m.trim());
					distributionConfig.DefaultCacheBehavior.AllowedMethods.Items =
						allowedMethodsArray;
					distributionConfig.DefaultCacheBehavior.AllowedMethods.Quantity =
						allowedMethodsArray.length;
				}

				// Update cached methods
				if (
					cachedMethods &&
					distributionConfig.DefaultCacheBehavior.CachedMethods
				) {
					const cachedMethodsArray = cachedMethods
						.split(",")
						.map((m) => m.trim());
					distributionConfig.DefaultCacheBehavior.CachedMethods.Items =
						cachedMethodsArray;
					distributionConfig.DefaultCacheBehavior.CachedMethods.Quantity =
						cachedMethodsArray.length;
				}

				// Update compression setting
				if (compress !== undefined) {
					distributionConfig.DefaultCacheBehavior.Compress = compress;
				}

				// Update forwarded values
				if (distributionConfig.DefaultCacheBehavior.ForwardedValues) {
					// Update query string forwarding
					if (forwardQueryString !== undefined) {
						distributionConfig.DefaultCacheBehavior.ForwardedValues.QueryString =
							forwardQueryString;
					}

					// Update forwarded headers
					if (
						forwardedHeaders &&
						distributionConfig.DefaultCacheBehavior.ForwardedValues.Headers
					) {
						const headersArray = forwardedHeaders
							.split(",")
							.map((h) => h.trim());
						distributionConfig.DefaultCacheBehavior.ForwardedValues.Headers.Items =
							headersArray;
						distributionConfig.DefaultCacheBehavior.ForwardedValues.Headers.Quantity =
							headersArray.length;
					}
				}
			}

			// Update price class
			if (priceClass) {
				distributionConfig.PriceClass = priceClass;
			}

			// Update viewer certificate
			if (distributionConfig.ViewerCertificate) {
				if (viewerCertificateCloudFrontDefaultCertificate !== undefined) {
					distributionConfig.ViewerCertificate.CloudFrontDefaultCertificate =
						viewerCertificateCloudFrontDefaultCertificate;

					// If switching to ACM certificate, clear CloudFrontDefaultCertificate
					if (
						!viewerCertificateCloudFrontDefaultCertificate &&
						viewerCertificateAcmCertificateArn
					) {
						distributionConfig.ViewerCertificate.ACMCertificateArn =
							viewerCertificateAcmCertificateArn;
						distributionConfig.ViewerCertificate.SSLSupportMethod =
							viewerCertificateSslSupportMethod || "sni-only";

						if (viewerCertificateMinimumProtocolVersion) {
							distributionConfig.ViewerCertificate.MinimumProtocolVersion =
								viewerCertificateMinimumProtocolVersion;
						}
					}
				} else if (viewerCertificateAcmCertificateArn) {
					// Update ACM certificate ARN
					distributionConfig.ViewerCertificate.ACMCertificateArn =
						viewerCertificateAcmCertificateArn;
					distributionConfig.ViewerCertificate.CloudFrontDefaultCertificate = false;

					// Update SSL support method if provided
					if (viewerCertificateSslSupportMethod) {
						distributionConfig.ViewerCertificate.SSLSupportMethod =
							viewerCertificateSslSupportMethod;
					}

					// Update minimum protocol version if provided
					if (viewerCertificateMinimumProtocolVersion) {
						distributionConfig.ViewerCertificate.MinimumProtocolVersion =
							viewerCertificateMinimumProtocolVersion;
					}
				} else if (viewerCertificateMinimumProtocolVersion) {
					// Just update the minimum protocol version
					distributionConfig.ViewerCertificate.MinimumProtocolVersion =
						viewerCertificateMinimumProtocolVersion;
				}
			}

			// Update logging configuration
			if (loggingEnabled !== undefined || loggingBucket || loggingPrefix) {
				if (!distributionConfig.Logging) {
					distributionConfig.Logging = {
						Enabled: false,
						IncludeCookies: false,
						Bucket: "",
						Prefix: "",
					};
				}

				if (loggingEnabled !== undefined) {
					distributionConfig.Logging.Enabled = loggingEnabled;
				}

				if (loggingBucket) {
					distributionConfig.Logging.Bucket = loggingBucket;
				}

				if (loggingPrefix !== undefined) {
					distributionConfig.Logging.Prefix = loggingPrefix;
				}
			}

			// Update enabled state
			if (enabled !== undefined) {
				distributionConfig.Enabled = enabled;
			}

			// Update aliases
			if (aliases !== undefined) {
				const aliasesArray = aliases
					.split(",")
					.map((a) => a.trim())
					.filter((a) => a.length > 0);

				if (!distributionConfig.Aliases) {
					distributionConfig.Aliases = {
						Quantity: 0,
						Items: [],
					};
				}

				distributionConfig.Aliases.Items = aliasesArray;
				distributionConfig.Aliases.Quantity = aliasesArray.length;
			}

			// Update default root object
			if (defaultRootObject !== undefined) {
				distributionConfig.DefaultRootObject = defaultRootObject;
			}

			// Update custom error responses
			if (errorPages) {
				const errorPagesArray = JSON.parse(errorPages);

				if (!distributionConfig.CustomErrorResponses) {
					distributionConfig.CustomErrorResponses = {
						Quantity: 0,
						Items: [],
					};
				}

				distributionConfig.CustomErrorResponses.Items = errorPagesArray.map(
					(error: any) => ({
						ErrorCode: error.ErrorCode,
						ResponsePagePath: error.ResponsePagePath,
						ResponseCode: error.ResponseCode,
						ErrorCachingMinTTL: error.TTL || 300,
					}),
				);

				distributionConfig.CustomErrorResponses.Quantity =
					errorPagesArray.length;
			}

			// Update geo restrictions
			if (
				restrictionsGeoRestrictionType ||
				restrictionsGeoRestrictionLocations
			) {
				if (!distributionConfig.Restrictions) {
					distributionConfig.Restrictions = {
						GeoRestriction: {
							RestrictionType: "none",
							Quantity: 0,
							Items: [],
						},
					};
				}

				if (restrictionsGeoRestrictionType) {
					distributionConfig.Restrictions.GeoRestriction.RestrictionType =
						restrictionsGeoRestrictionType.toUpperCase();
				}

				if (restrictionsGeoRestrictionLocations) {
					const locationsArray = restrictionsGeoRestrictionLocations
						.split(",")
						.map((l) => l.trim());
					distributionConfig.Restrictions.GeoRestriction.Items = locationsArray;
					distributionConfig.Restrictions.GeoRestriction.Quantity =
						locationsArray.length;
				}
			}

			// Update web ACL ID
			if (webAclId !== undefined) {
				distributionConfig.WebACLId = webAclId;
			}

			// Create the update command
			const updateCommand = new UpdateDistributionCommand({
				Id: distributionId,
				IfMatch: ifMatch,
				DistributionConfig: distributionConfig,
			});

			// Send the update command
			const updateResponse = await client.send(updateCommand);

			return {
				distributionId: updateResponse.Distribution?.Id || distributionId,
				domainName: updateResponse.Distribution?.DomainName || "",
				etag: updateResponse.ETag || "",
				status: updateResponse.Distribution?.Status || "",
			};
		} catch (error) {
			console.error(
				`Error updating CloudFront distribution ${distributionId}:`,
				error,
			);
			throw error;
		}
	}
}

const updateDistributionService = new UpdateDistributionService();

export default new BaseService(
	updateDistributionService.toolName,
	updateDistributionService.description,
	updateDistributionService.updateDistributionInput,
	updateDistributionService.updateDistributionZodInput,
	updateDistributionService.updateDistribution.bind(updateDistributionService),
);
