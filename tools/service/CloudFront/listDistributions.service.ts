import {
	CloudFrontClient,
	ListDistributionsCommand,
	type DistributionSummary,
	type Origin,
} from "@aws-sdk/client-cloudfront";
import { z } from "zod";
import BaseService from "../base.service";

class ListDistributionsService {
	/**
	 * Retrieves and displays a detailed list of CloudFront distributions
	 * @param outputFormat Optional format for the output (text, json, table)
	 * @returns Promise containing array of CloudFront distributions with filtered data
	 */

	toolName = "list-cloudfront-distributions";
	description =
		"Retrieves and displays a detailed list of CloudFront distributions associated with your AWS account";

	listDistributionsInput = {
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.default("text")
			.describe("Specifies the desired output format (text, json, table)"),
	};

	listDistributionsZodInput = z.object(this.listDistributionsInput);

	async listDistributions(params: Record<string, unknown>): Promise<{
		distributions: Array<{
			id: string;
			domainName: string;
			status: string;
			enabled: boolean;
			origins: Array<{
				domainName: string;
				id: string;
				path?: string;
			}>;
			comment?: string;
			aliases?: string[];
		}>;
		rawOutput?: DistributionSummary[];
	}> {
		const { outputFormat = "text" } = params as {
			outputFormat?: "text" | "json" | "table";
		};

		try {
			const client = new CloudFrontClient({});
			const command = new ListDistributionsCommand({});
			const response = await client.send(command);

			const distributions = response.DistributionList?.Items || [];

			// Format and return the data
			const formattedDistributions = distributions.map(
				(dist: DistributionSummary) => ({
					id: dist.Id || "",
					domainName: dist.DomainName || "",
					status: dist.Status || "",
					enabled: dist.Enabled || false,
					origins: (dist.Origins?.Items || []).map((origin: Origin) => ({
						domainName: origin.DomainName || "",
						id: origin.Id || "",
						path: origin.OriginPath || undefined,
					})),
					comment: dist.Comment || undefined,
					aliases: dist.Aliases?.Items || undefined,
				}),
			);

			// If raw output is requested via json format, include it
			if (outputFormat === "json") {
				return {
					distributions: formattedDistributions,
					rawOutput: distributions,
				};
			}

			return { distributions: formattedDistributions };
		} catch (error) {
			console.error("Error listing CloudFront distributions:", error);
			throw error;
		}
	}
}

const listDistributionsService = new ListDistributionsService();

export default new BaseService(
	listDistributionsService.toolName,
	listDistributionsService.description,
	listDistributionsService.listDistributionsInput,
	listDistributionsService.listDistributionsZodInput,
	listDistributionsService.listDistributions.bind(listDistributionsService),
);
