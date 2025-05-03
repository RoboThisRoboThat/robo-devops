import {
	Route53Client,
	GetReusableDelegationSetCommand,
} from "@aws-sdk/client-route-53";
import { z } from "zod";
import BaseService from "../base.service";

class GetReusableDelegationSetService {
	/**
	 * Retrieves information about a specified reusable delegation set
	 * @param id ID of the reusable delegation set
	 * @param outputFormat Optional format for the output
	 * @returns Promise containing delegation set info
	 */

	toolName = "get-reusable-delegation-set";
	description =
		"Retrieves information about a specified reusable delegation set";
	getReusableDelegationSetInput = {
		id: z.string().describe("The ID of the reusable delegation set"),
		outputFormat: z
			.enum(["text", "json"])
			.optional()
			.describe("Specifies the output format (text, json)"),
	};

	getReusableDelegationSetZodInput = z.object(
		this.getReusableDelegationSetInput,
	);

	async getReusableDelegationSet({
		id,
		outputFormat = "json",
	}: {
		id: string;
		outputFormat?: "text" | "json";
	}) {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			// Handle if the ID includes the /delegationset/ prefix
			const delegationSetId = id.replace(/^\/delegationset\//, "");

			const command = new GetReusableDelegationSetCommand({
				Id: delegationSetId,
			});
			const response = await route53Client.send(command);

			return response;
		} catch (error) {
			console.error(`Error getting reusable delegation set ${id}:`, error);
			throw error;
		}
	}
}

const getReusableDelegationSetService = new GetReusableDelegationSetService();

export default new BaseService(
	getReusableDelegationSetService.toolName,
	getReusableDelegationSetService.description,
	getReusableDelegationSetService.getReusableDelegationSetInput,
	getReusableDelegationSetService.getReusableDelegationSetZodInput,
	getReusableDelegationSetService.getReusableDelegationSet,
);
