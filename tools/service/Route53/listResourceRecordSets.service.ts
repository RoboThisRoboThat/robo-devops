import {
	Route53Client,
	ListResourceRecordSetsCommand,
	type ResourceRecordSet,
} from "@aws-sdk/client-route-53";
import { z } from "zod";
import BaseService from "../base.service";

class ListResourceRecordSetsService {
	/**
	 * Retrieves a detailed list of resource record sets in a hosted zone
	 * @param hostedZoneId ID of the hosted zone to list records from
	 * @param startRecordName Optional first name in the lexicographic ordering to list from
	 * @param startRecordType Optional record type to start listing from
	 * @param startRecordIdentifier Optional record identifier to start from
	 * @param maxItems Optional maximum number of records to return
	 * @param outputFormat Optional format for the output
	 * @returns Promise containing array of resource record sets
	 */

	toolName = "list-resource-record-sets";
	description =
		"Retrieves a detailed list of resource record sets in a hosted zone";
	listResourceRecordSetsInput = {
		hostedZoneId: z.string().describe("Specifies the ID of the hosted zone"),
		startRecordName: z
			.string()
			.optional()
			.describe(
				"The first name in the lexicographic ordering of resource record sets that you want to list",
			),
		startRecordType: z
			.string()
			.optional()
			.describe("The type of records you want to start listing from"),
		startRecordIdentifier: z
			.string()
			.optional()
			.describe(
				"If you have multiple records with the same name and type, this specifies the record identifier to start from",
			),
		maxItems: z
			.string()
			.optional()
			.describe("The maximum number of records to return"),
		outputFormat: z
			.enum(["text", "json", "table"])
			.optional()
			.describe("Specifies the output format (text, json, table)"),
	};

	listResourceRecordSetsZodInput = z.object(this.listResourceRecordSetsInput);

	async listResourceRecordSets({
		hostedZoneId,
		startRecordName,
		startRecordType,
		startRecordIdentifier,
		maxItems,
		outputFormat = "json",
	}: {
		hostedZoneId: string;
		startRecordName?: string;
		startRecordType?: string;
		startRecordIdentifier?: string;
		maxItems?: string;
		outputFormat?: "text" | "json" | "table";
	}): Promise<ResourceRecordSet[]> {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			// Remove /hostedzone/ prefix if present
			const id = hostedZoneId.replace(/^\/hostedzone\//, "");

			const command = new ListResourceRecordSetsCommand({
				HostedZoneId: id,
				StartRecordName: startRecordName,
				StartRecordType: startRecordType,
				StartRecordIdentifier: startRecordIdentifier,
				MaxItems: maxItems,
			});

			const response = await route53Client.send(command);
			return response.ResourceRecordSets || [];
		} catch (error) {
			console.error(
				`Error listing resource record sets for hosted zone ${hostedZoneId}:`,
				error,
			);
			throw error;
		}
	}
}

const listResourceRecordSetsService = new ListResourceRecordSetsService();

export default new BaseService(
	listResourceRecordSetsService.toolName,
	listResourceRecordSetsService.description,
	listResourceRecordSetsService.listResourceRecordSetsInput,
	listResourceRecordSetsService.listResourceRecordSetsZodInput,
	listResourceRecordSetsService.listResourceRecordSets,
);
