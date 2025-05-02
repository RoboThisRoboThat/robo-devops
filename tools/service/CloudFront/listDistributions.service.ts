import {
	CloudFrontClient,
	ListDistributionsCommand,
	type DistributionSummary,
} from "@aws-sdk/client-cloudfront";
import { z } from "zod";

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

	async listDistributions({
		outputFormat = "text",
	}: {
		outputFormat?: "text" | "json" | "table";
	}): Promise<{
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
					origins: (dist.Origins?.Items || []).map((origin: any) => ({
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

export default new ListDistributionsService();
