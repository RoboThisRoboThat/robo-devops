import { Route53Client, GetHostedZoneCommand } from "@aws-sdk/client-route-53";
import { z } from "zod";
import BaseService from "../base.service";

class GetHostedZoneService {
	/**
	 * Displays detailed information about a specific Route 53 hosted zone
	 * @param hostedZoneId ID of the hosted zone to retrieve
	 * @param outputFormat Optional format for the output
	 * @returns Promise containing details of the requested hosted zone
	 */

	toolName = "get-hosted-zone";
	description =
		"Displays detailed information about a specific Route 53 hosted zone";
	getHostedZoneInput = {
		hostedZoneId: z
			.string()
			.describe(
				"Specifies the ID of the hosted zone (e.g., /hostedzone/Z1234567890ABCDEF)",
			),
		outputFormat: z
			.enum(["text", "json"])
			.optional()
			.describe("Specifies the output format (text, json)"),
	};

	getHostedZoneZodInput = z.object(this.getHostedZoneInput);

	async getHostedZone({
		hostedZoneId,
		outputFormat = "json",
	}: {
		hostedZoneId: string;
		outputFormat?: "text" | "json";
	}) {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			// Remove /hostedzone/ prefix if present
			const id = hostedZoneId.replace(/^\/hostedzone\//, "");

			const command = new GetHostedZoneCommand({ Id: id });
			const response = await route53Client.send(command);

			return response;
		} catch (error) {
			console.error(
				`Error getting Route53 hosted zone ${hostedZoneId}:`,
				error,
			);
			throw error;
		}
	}
}

const getHostedZoneService = new GetHostedZoneService();

export default new BaseService(
	getHostedZoneService.toolName,
	getHostedZoneService.description,
	getHostedZoneService.getHostedZoneInput,
	getHostedZoneService.getHostedZoneZodInput,
	getHostedZoneService.getHostedZone,
);
