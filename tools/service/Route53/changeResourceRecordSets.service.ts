import {
	Route53Client,
	ChangeResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";
import { z } from "zod";
import fs from "node:fs";
import BaseService from "../base.service";

class ChangeResourceRecordSetsService {
	/**
	 * Creates, updates, or deletes resource record sets in a hosted zone
	 * @param hostedZoneId ID of the hosted zone to modify
	 * @param changeBatch JSON string or path to a JSON file defining changes to be made
	 * @returns Promise containing the change info
	 */

	toolName = "change-resource-record-sets";
	description =
		"Creates, updates, or deletes resource record sets in a hosted zone";
	changeResourceRecordSetsInput = {
		hostedZoneId: z
			.string()
			.describe("Specifies the ID of the hosted zone to modify"),
		changeBatch: z
			.string()
			.describe(
				`A JSON string or a path to a JSON file that defines the changes to be made to the resource record sets. This includes an array of 'Changes', where each change specifies an 'Action' (CREATE, DELETE, UPSERT) and a 'ResourceRecordSet' object.`,
			),
	};

	changeResourceRecordSetsZodInput = z.object(
		this.changeResourceRecordSetsInput,
	);

	async changeResourceRecordSets({
		hostedZoneId,
		changeBatch,
	}: {
		hostedZoneId: string;
		changeBatch: string;
	}) {
		try {
			// Create a Route53 client
			const route53Client = new Route53Client({});

			// Remove /hostedzone/ prefix if present
			const id = hostedZoneId.replace(/^\/hostedzone\//, "");

			// Parse the changeBatch from string or from a file
			let parsedChangeBatch;
			try {
				if (fs.existsSync(changeBatch)) {
					// If it's a file path, read the file
					const fileContent = fs.readFileSync(changeBatch, "utf8");
					parsedChangeBatch = JSON.parse(fileContent);
				} else {
					// Otherwise treat it as a JSON string
					parsedChangeBatch = JSON.parse(changeBatch);
				}
			} catch (error) {
				throw new Error(`Failed to parse changeBatch: ${error}`);
			}

			const command = new ChangeResourceRecordSetsCommand({
				HostedZoneId: id,
				ChangeBatch: parsedChangeBatch,
			});

			const response = await route53Client.send(command);
			return response;
		} catch (error) {
			console.error(
				`Error changing resource record sets for hosted zone ${hostedZoneId}:`,
				error,
			);
			throw error;
		}
	}
}

const changeResourceRecordSetsService = new ChangeResourceRecordSetsService();

export default new BaseService(
	changeResourceRecordSetsService.toolName,
	changeResourceRecordSetsService.description,
	changeResourceRecordSetsService.changeResourceRecordSetsInput,
	changeResourceRecordSetsService.changeResourceRecordSetsZodInput,
	changeResourceRecordSetsService.changeResourceRecordSets,
);
