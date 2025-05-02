import {
	Route53Client,
	ListHostedZonesCommand,
	type HostedZone,
} from "@aws-sdk/client-route-53";
import { z } from "zod";

class ListHostedZonesService {
	/**
	 * Retrieves a detailed list of Route 53 hosted zones
	 * @param outputFormat Optional format for the output
	 * @returns Promise containing array of Route 53 hosted zones
	 */

	toolName = "list-hosted-zones";
	description = "Retrieves a detailed list of Route 53 hosted zones";
	listHostedZonesInput = {
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the desired output format (text, json, table)"),
	};

	listHostedZonesZodInput = z.object(this.listHostedZonesInput);

	async listHostedZones({
		outputFormat = "json",
	}: {
		outputFormat?: "text" | "json" | "table";
	}): Promise<HostedZone[]> {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			const command = new ListHostedZonesCommand({});
			const response = await route53Client.send(command);

			// Format output based on the requested format
			if (outputFormat === "json") {
				return response.HostedZones || [];
			} else {
				// Still return the full data - formatting will be handled by the consumer
				return response.HostedZones || [];
			}
		} catch (error) {
			console.error("Error listing Route53 hosted zones:", error);
			throw error;
		}
	}
}

export default new ListHostedZonesService();
