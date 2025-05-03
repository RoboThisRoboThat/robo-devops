import {
	Route53Client,
	ListReusableDelegationSetsCommand,
} from "@aws-sdk/client-route-53";
import { z } from "zod";
import BaseService from "../base.service";

class ListReusableDelegationSetsService {
	/**
	 * Retrieves a list of reusable delegation sets
	 * @param outputFormat Optional format for the output
	 * @returns Promise containing array of reusable delegation sets
	 */

	toolName = "list-reusable-delegation-sets";
	description = "Retrieves a list of reusable delegation sets";
	listReusableDelegationSetsInput = {
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the desired output format (text, json, table)"),
	};

	listReusableDelegationSetsZodInput = z.object(
		this.listReusableDelegationSetsInput,
	);

	async listReusableDelegationSets({
		outputFormat = "json",
	}: {
		outputFormat?: "text" | "json" | "table";
	}) {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			const command = new ListReusableDelegationSetsCommand({});
			const response = await route53Client.send(command);

			return response.DelegationSets || [];
		} catch (error) {
			console.error("Error listing reusable delegation sets:", error);
			throw error;
		}
	}
}

const listReusableDelegationSetsService =
	new ListReusableDelegationSetsService();

export default new BaseService(
	listReusableDelegationSetsService.toolName,
	listReusableDelegationSetsService.description,
	listReusableDelegationSetsService.listReusableDelegationSetsInput,
	listReusableDelegationSetsService.listReusableDelegationSetsZodInput,
	listReusableDelegationSetsService.listReusableDelegationSets,
);
