import {
	Route53Client,
	CreateHostedZoneCommand,
} from "@aws-sdk/client-route-53";
import { z } from "zod";

class CreateHostedZoneService {
	/**
	 * Creates a new Route 53 hosted zone
	 * @param name Domain name for the hosted zone
	 * @param callerReference Unique string to identify the request
	 * @param hostedZoneConfig Optional configuration for the hosted zone
	 * @param delegationSetId Optional reusable delegation set to associate with the zone
	 * @returns Promise containing the created hosted zone details
	 */

	toolName = "create-hosted-zone";
	description = "Creates a new Route 53 hosted zone";
	createHostedZoneInput = {
		name: z
			.string()
			.describe(
				"The domain name for which you want to create the hosted zone (e.g., example.com)",
			),
		callerReference: z
			.string()
			.describe("A unique string that identifies the request"),
		hostedZoneConfig: z
			.string()
			.optional()
			.describe(
				"A JSON string or path to a JSON file specifying configuration options for the hosted zone (e.g., comment)",
			),
		delegationSetId: z
			.string()
			.optional()
			.describe(
				"If you want to associate the hosted zone with a reusable delegation set",
			),
	};

	createHostedZoneZodInput = z.object(this.createHostedZoneInput);

	async createHostedZone({
		name,
		callerReference,
		hostedZoneConfig,
		delegationSetId,
	}: {
		name: string;
		callerReference: string;
		hostedZoneConfig?: string;
		delegationSetId?: string;
	}) {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			// Ensure the domain name ends with a dot
			const domainName = name.endsWith(".") ? name : `${name}.`;

			// Parse hostedZoneConfig if provided
			let configObject;
			if (hostedZoneConfig) {
				try {
					configObject = JSON.parse(hostedZoneConfig);
				} catch (error) {
					throw new Error(`Invalid hostedZoneConfig JSON: ${error}`);
				}
			}

			const command = new CreateHostedZoneCommand({
				Name: domainName,
				CallerReference: callerReference,
				HostedZoneConfig: configObject,
				DelegationSetId: delegationSetId,
			});

			const response = await route53Client.send(command);
			return response;
		} catch (error) {
			console.error(`Error creating Route53 hosted zone for ${name}:`, error);
			throw error;
		}
	}
}

export default new CreateHostedZoneService();
