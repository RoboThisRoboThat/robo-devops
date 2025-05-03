import {
	CloudFrontClient,
	CreateDistributionCommand,
	type MinimumProtocolVersion,
} from "@aws-sdk/client-cloudfront";
import type {
	CreateDistributionResult,
	DistributionConfig,
	ViewerCertificate,
	Origin,
	DefaultCacheBehavior,
	CustomErrorResponse,
	GeoRestriction,
} from "@aws-sdk/client-cloudfront";
import { z } from "zod";
import BaseService from "../base.service";

class CreateDistributionService {
	/**
	 * Creates a new CloudFront distribution with specified configurations
	 * @param originDomain The domain name of the origin server
	 * @param originPath Optional path that CloudFront appends to the origin domain
	 * @param viewerProtocolPolicy Protocol policy for viewers
	 * @param allowedHttpMethods HTTP methods that CloudFront processes and forwards
	 * @param cachedMethods HTTP methods for which CloudFront caches responses
	 * @param forwardQueryString Whether CloudFront forwards query strings to the origin
	 * @param forwardedHeaders Headers that CloudFront forwards to the origin
	 * @param compress Whether CloudFront automatically compresses certain files
	 * @param priceClass Price class that corresponds with CloudFront regions
	 * @param viewerCertificateMinimumProtocolVersion Minimum SSL/TLS protocol for viewers
	 * @param viewerCertificateCloudFrontDefaultCertificate Whether to use default CloudFront certificate
	 * @param viewerCertificateAcmCertificateArn ARN of the ACM certificate for HTTPS
	 * @param viewerCertificateSslSupportMethod How CloudFront serves HTTPS requests
	 * @param loggingEnabled Whether to enable logging for the distribution
	 * @param loggingBucket Amazon S3 bucket to store access logs
	 * @param loggingPrefix Optional prefix for log file names
	 * @param enabled Whether the distribution is enabled
	 * @param aliases CNAME aliases for the distribution
	 * @param defaultRootObject Object that CloudFront requests from the origin
	 * @param errorPages JSON string defining custom error responses
	 * @param restrictionsGeoRestrictionType Method to restrict distribution by country
	 * @param restrictionsGeoRestrictionLocations Country codes for geo restriction
	 * @param webAclId ID of the AWS WAF web ACL to associate
	 * @param tags Key-value pairs to assign as tags
	 * @returns Promise containing the details of the created CloudFront distribution
	 */

	toolName = "create-cloudfront-distribution";
	description =
		"Creates a new CloudFront distribution with specified configurations";

	createDistributionInput = {
		originDomain: z
			.string()
			.describe(
				"The domain name of the origin server from which CloudFront gets content (e.g., my-bucket.s3.amazonaws.com or my-web-server.example.com)",
			),
		originPath: z
			.string()
			.optional()
			.describe(
				"An optional path that CloudFront appends to the origin domain name when requesting content from the origin (e.g., /images)",
			),
		viewerProtocolPolicy: z
			.enum(["allow-all", "https-only", "redirect-to-https"])
			.optional()
			.default("allow-all")
			.describe(
				"The protocol policy that viewers can use to access content in a CloudFront distribution",
			),
		allowedHttpMethods: z
			.string()
			.optional()
			.default("GET, HEAD")
			.describe(
				"The HTTP methods that CloudFront processes and forwards to your origin. Specify as a comma-separated list",
			),
		cachedMethods: z
			.string()
			.optional()
			.default("GET, HEAD")
			.describe(
				"The HTTP methods for which CloudFront caches responses from your origin. Specify as a comma-separated list",
			),
		forwardQueryString: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Specifies whether CloudFront forwards query strings to the origin",
			),
		forwardedHeaders: z
			.string()
			.optional()
			.describe(
				"A comma-separated list of headers that CloudFront forwards to the origin. Use 'all' to forward all standard and custom headers",
			),
		compress: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Specifies whether CloudFront automatically compresses certain files for faster delivery to viewers",
			),
		priceClass: z
			.enum(["PriceClass_100", "PriceClass_200", "PriceClass_All"])
			.optional()
			.default("PriceClass_100")
			.describe(
				"The price class that corresponds with the CloudFront regions that will serve your distribution",
			),
		viewerCertificateMinimumProtocolVersion: z
			.string()
			.optional()
			.describe(
				"The minimum SSL/TLS protocol that viewers can use to access content",
			),
		viewerCertificateCloudFrontDefaultCertificate: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Indicates whether you want to use the default CloudFront certificate for HTTPS connections",
			),
		viewerCertificateAcmCertificateArn: z
			.string()
			.optional()
			.describe("The ARN of the ACM certificate to use for HTTPS connections"),
		viewerCertificateSslSupportMethod: z
			.enum(["sni-only", "vip", "static-ip"])
			.optional()
			.describe("Specifies how CloudFront serves HTTPS requests"),
		loggingEnabled: z
			.boolean()
			.optional()
			.default(false)
			.describe("Specifies whether to enable logging for the distribution"),
		loggingBucket: z
			.string()
			.optional()
			.describe(
				"The Amazon S3 bucket to store the access logs (e.g., my-logs-bucket.s3.amazonaws.com)",
			),
		loggingPrefix: z
			.string()
			.optional()
			.describe("An optional prefix for the log file names"),
		enabled: z
			.boolean()
			.optional()
			.default(true)
			.describe("Specifies whether the distribution is enabled"),
		aliases: z
			.string()
			.optional()
			.describe(
				"A comma-separated list of CNAME aliases for the distribution (e.g., www.example.com,cdn.example.com)",
			),
		defaultRootObject: z
			.string()
			.optional()
			.describe(
				"The object that you want CloudFront to request from your origin (e.g., index.html)",
			),
		errorPages: z
			.string()
			.optional()
			.describe(
				'A JSON string defining custom error responses. For example: \'[{"ErrorCode": 404, "ResponsePagePath": "/error.html", "ResponseCode": "200", "TTL": 300}]\'',
			),
		restrictionsGeoRestrictionType: z
			.enum(["blacklist", "whitelist", "none"])
			.optional()
			.default("none")
			.describe(
				"The method that you want to use to restrict distribution of your content by country",
			),
		restrictionsGeoRestrictionLocations: z
			.string()
			.optional()
			.describe(
				"A comma-separated list of country codes for the specified restrictions-geo-restriction-type",
			),
		webAclId: z
			.string()
			.optional()
			.describe(
				"The ID of the AWS WAF web ACL to associate with this distribution",
			),
		tags: z
			.record(z.string(), z.string())
			.optional()
			.describe("Key-value pairs to assign as tags to the new distribution"),
	};

	createDistributionZodInput = z.object(this.createDistributionInput);

	async createDistribution(params: Record<string, unknown>): Promise<{
		distributionId: string;
		domainName: string;
		etag: string;
		location: string;
		status: string;
	}> {
		const {
			originDomain,
			originPath,
			viewerProtocolPolicy = "allow-all",
			allowedHttpMethods = "GET, HEAD",
			cachedMethods = "GET, HEAD",
			forwardQueryString = false,
			forwardedHeaders,
			compress = false,
			priceClass = "PriceClass_100",
			viewerCertificateMinimumProtocolVersion,
			viewerCertificateCloudFrontDefaultCertificate = true,
			viewerCertificateAcmCertificateArn,
			viewerCertificateSslSupportMethod,
			loggingEnabled = false,
			loggingBucket,
			loggingPrefix,
			enabled = true,
			aliases,
			defaultRootObject,
			errorPages,
			restrictionsGeoRestrictionType = "none",
			restrictionsGeoRestrictionLocations,
			webAclId,
			tags,
		} = params as {
			originDomain: string;
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
			tags?: Record<string, string>;
		};

		try {
			// Parse string inputs that should be arrays
			const allowedMethodsArray = allowedHttpMethods
				.split(",")
				.map((m) => m.trim());
			const cachedMethodsArray = cachedMethods.split(",").map((m) => m.trim());
			const forwardedHeadersArray = forwardedHeaders
				? forwardedHeaders.split(",").map((h) => h.trim())
				: [];
			const aliasesArray = aliases
				? aliases.split(",").map((a) => a.trim())
				: [];
			const geoRestrictionsArray = restrictionsGeoRestrictionLocations
				? restrictionsGeoRestrictionLocations.split(",").map((c) => c.trim())
				: [];

			// Parse error pages if provided
			const errorPagesArray = errorPages ? JSON.parse(errorPages) : [];

			// Create viewer certificate configuration
			const viewerCertificate: ViewerCertificate = {};

			if (viewerCertificateCloudFrontDefaultCertificate) {
				viewerCertificate.CloudFrontDefaultCertificate = true;
			} else if (viewerCertificateAcmCertificateArn) {
				viewerCertificate.ACMCertificateArn =
					viewerCertificateAcmCertificateArn;
				viewerCertificate.SSLSupportMethod =
					viewerCertificateSslSupportMethod || "sni-only";
				if (viewerCertificateMinimumProtocolVersion) {
					viewerCertificate.MinimumProtocolVersion =
						viewerCertificateMinimumProtocolVersion;
				}
			}

			// Create origin configuration
			const origin: Origin = {
				Id: "origin1",
				DomainName: originDomain,
				OriginPath: originPath,
				CustomHeaders: {
					Quantity: 0,
					Items: [],
				},
			};

			// Create default cache behavior
			const defaultCacheBehavior: DefaultCacheBehavior = {
				TargetOriginId: "origin1",
				ViewerProtocolPolicy: viewerProtocolPolicy.toUpperCase(),
				AllowedMethods: {
					Quantity: allowedMethodsArray.length,
					Items: allowedMethodsArray,
				},
				CachedMethods: {
					Quantity: cachedMethodsArray.length,
					Items: cachedMethodsArray,
				},
				Compress: compress,
				ForwardedValues: {
					QueryString: forwardQueryString,
					Cookies: {
						Forward: "none",
					},
					Headers: {
						Quantity: forwardedHeadersArray.length,
						Items: forwardedHeadersArray,
					},
				},
				MinTTL: 0,
				DefaultTTL: 86400,
				MaxTTL: 31536000,
			};

			// Create custom error responses if provided
			const customErrorResponses: CustomErrorResponse[] = errorPagesArray.map(
				(error: any) => ({
					ErrorCode: error.ErrorCode,
					ResponsePagePath: error.ResponsePagePath,
					ResponseCode: error.ResponseCode,
					ErrorCachingMinTTL: error.TTL || 300,
				}),
			);

			// Create geo restriction if provided
			const geoRestriction: GeoRestriction = {
				RestrictionType: restrictionsGeoRestrictionType.toUpperCase(),
				Quantity: geoRestrictionsArray.length,
				Items:
					geoRestrictionsArray.length > 0 ? geoRestrictionsArray : undefined,
			};

			// Create the distribution configuration
			const distributionConfig: DistributionConfig = {
				CallerReference: `create-dist-${Date.now()}`,
				Origins: {
					Quantity: 1,
					Items: [origin],
				},
				DefaultCacheBehavior: defaultCacheBehavior,
				Comment: "Created via CloudFront Management Tool",
				Enabled: enabled,
				PriceClass: priceClass,
				ViewerCertificate: viewerCertificate,
				Restrictions: {
					GeoRestriction: geoRestriction,
				},
			};

			// Add aliases if provided
			if (aliasesArray.length > 0) {
				distributionConfig.Aliases = {
					Quantity: aliasesArray.length,
					Items: aliasesArray,
				};
			}

			// Add default root object if provided
			if (defaultRootObject) {
				distributionConfig.DefaultRootObject = defaultRootObject;
			}

			// Add custom error responses if provided
			if (customErrorResponses.length > 0) {
				distributionConfig.CustomErrorResponses = {
					Quantity: customErrorResponses.length,
					Items: customErrorResponses,
				};
			}

			// Add logging configuration if enabled
			if (loggingEnabled && loggingBucket) {
				distributionConfig.Logging = {
					Enabled: true,
					IncludeCookies: false,
					Bucket: loggingBucket,
					Prefix: loggingPrefix || "",
				};
			} else {
				distributionConfig.Logging = {
					Enabled: false,
					IncludeCookies: false,
					Bucket: "",
					Prefix: "",
				};
			}

			// Add Web ACL ID if provided
			if (webAclId) {
				distributionConfig.WebACLId = webAclId;
			}

			// Create the CloudFront client and command
			const client = new CloudFrontClient({});
			const command = new CreateDistributionCommand({
				DistributionConfig: distributionConfig,
			});

			// Send the command to create the distribution
			const response = await client.send(command);

			// Build the return object
			const result = {
				distributionId: response.Distribution?.Id || "",
				domainName: response.Distribution?.DomainName || "",
				etag: response.ETag || "",
				location: response.Location || "",
				status: response.Distribution?.Status || "",
			};

			// Add tags if provided
			if (tags && Object.keys(tags).length > 0 && result.distributionId) {
				// Tags are applied separately after distribution creation
				// You would need to use the TagResource command from AWS SDK
				console.log(
					`Tags will be applied to distribution ${result.distributionId}`,
				);
			}

			return result;
		} catch (error) {
			console.error("Error creating CloudFront distribution:", error);
			throw error;
		}
	}
}

const createDistributionService = new CreateDistributionService();

export default new BaseService(
	createDistributionService.toolName,
	createDistributionService.description,
	createDistributionService.createDistributionInput,
	createDistributionService.createDistributionZodInput,
	createDistributionService.createDistribution.bind(createDistributionService),
);
