import { Route53Client, GetChangeCommand } from "@aws-sdk/client-route-53";
import { z } from "zod";
import BaseService from "../base.service";

class GetChangeService {
	/**
	 * Retrieves the status of a change batch request
	 * @param id ID of the change batch request
	 * @param outputFormat Optional format for the output
	 * @returns Promise containing the change info
	 */

	toolName = "get-change";
	description = "Retrieves the status of a change batch request";
	getChangeInput = {
		id: z
			.string()
			.describe(
				"The ID of the change batch request returned by change-resource-record-sets",
			),
		outputFormat: z
			.enum(["text", "json"])
			.optional()
			.describe("Specifies the output format (text, json)"),
	};

	getChangeZodInput = z.object(this.getChangeInput);

	async getChange({
		id,
		outputFormat = "json",
	}: {
		id: string;
		outputFormat?: "text" | "json";
	}) {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			// Remove /change/ prefix if present
			const changeId = id.replace(/^\/change\//, "");

			const command = new GetChangeCommand({ Id: changeId });
			const response = await route53Client.send(command);

			return response;
		} catch (error) {
			console.error(`Error getting change ${id}:`, error);
			throw error;
		}
	}
}

const getChangeService = new GetChangeService();

export default new BaseService(
	getChangeService.toolName,
	getChangeService.description,
	getChangeService.getChangeInput,
	getChangeService.getChangeZodInput,
	getChangeService.getChange,
);
