import {
	Route53Client,
	DeleteHostedZoneCommand,
} from "@aws-sdk/client-route-53";
import { z } from "zod";
import BaseService from "../base.service";

class DeleteHostedZoneService {
	/**
	 * Deletes a specified Route 53 hosted zone
	 * @param hostedZoneId ID of the hosted zone to delete
	 * @returns Promise containing the deletion result
	 */

	toolName = "delete-hosted-zone";
	description = "Deletes a specified Route 53 hosted zone";
	deleteHostedZoneInput = {
		hostedZoneId: z
			.string()
			.describe("Specifies the ID of the hosted zone to delete"),
	};

	deleteHostedZoneZodInput = z.object(this.deleteHostedZoneInput);

	async deleteHostedZone({
		hostedZoneId,
	}: {
		hostedZoneId: string;
	}) {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			// Remove /hostedzone/ prefix if present
			const id = hostedZoneId.replace(/^\/hostedzone\//, "");

			const command = new DeleteHostedZoneCommand({ Id: id });
			const response = await route53Client.send(command);

			return response;
		} catch (error) {
			console.error(
				`Error deleting Route53 hosted zone ${hostedZoneId}:`,
				error,
			);
			throw error;
		}
	}
}

const deleteHostedZoneService = new DeleteHostedZoneService();

export default new BaseService(
	deleteHostedZoneService.toolName,
	deleteHostedZoneService.description,
	deleteHostedZoneService.deleteHostedZoneInput,
	deleteHostedZoneService.deleteHostedZoneZodInput,
	deleteHostedZoneService.deleteHostedZone,
);
