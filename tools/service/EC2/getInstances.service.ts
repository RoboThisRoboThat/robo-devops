import {
	EC2Client,
	DescribeInstancesCommand,
	type Instance,
	type Filter,
} from "@aws-sdk/client-ec2";
import { z } from "zod";

class GetInstancesService {
	/**
	 * Gets EC2 instances in the specified region with flexible filtering options
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param filters Optional array of EC2 filters to apply
	 * @param nameFilter Optional filter to search instances by name (legacy parameter)
	 * @returns Promise containing array of EC2 instances with filtered data
	 */

	toolName = "get-ec2-instances";
	description =
		"Get EC2 instances from a specific AWS region with flexible filtering options";
	getInstancesInput = z.object({
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		filters: z
			.array(
				z.object({
					Name: z
						.string()
						.describe("Filter name (e.g., 'instance-type', 'tag:Environment')"),
					Values: z.array(z.string()).describe("Array of filter values"),
				}),
			)
			.optional()
			.describe("Array of AWS EC2 filters to apply"),
		nameFilter: z
			.string()
			.optional()
			.describe(
				"Optional filter to search instances by name (legacy parameter)",
			),
		includeStoppedInstances: z
			.boolean()
			.optional()
			.default(false)
			.describe("Whether to include stopped instances in results"),
	});
	async getInstances({
		region,
		filters = [],
		nameFilter,
		includeStoppedInstances = false,
	}: {
		region: string;
		filters?: Filter[];
		nameFilter?: string;
		includeStoppedInstances?: boolean;
	}): Promise<
		{
			name: string | null;
			instanceType: string | null;
			instanceId: string | null;
			projectTag: string | null;
			maintainerTag: string | null;
		}[]
	> {
		try {
			// Create a new EC2Client for each call with the provided region
			const ec2Client = new EC2Client({ region });

			// Process filters to make them search-based and case-insensitive
			const processedFilters: Filter[] = filters.map((filter) => {
				// Apply wildcards to all other filter values for non-exact matching
				return {
					Name: filter.Name || "",
					Values: (filter.Values || []).map((value) =>
						// Add wildcards for partial matching if they don't already exist
						value.startsWith("*") && value.endsWith("*") ? value : `*${value}*`,
					),
				};
			});

			// Start with the processed filters array
			const combinedFilters: Filter[] = [...processedFilters];

			// Add instance state filter unless it's already specified in custom filters
			if (!filters.some((filter) => filter.Name === "instance-state-name")) {
				if (includeStoppedInstances) {
					combinedFilters.push({
						Name: "instance-state-name",
						Values: ["running", "pending", "stopped"],
					});
				} else {
					combinedFilters.push({
						Name: "instance-state-name",
						Values: ["running", "pending"],
					});
				}
			}

			// Add name filter if provided (for backward compatibility)
			// Already using wildcards and made case-insensitive by default
			if (nameFilter && !filters.some((filter) => filter.Name === "tag:Name")) {
				combinedFilters.push({
					Name: "tag:Name",
					Values: [`*${nameFilter.toLowerCase()}*`], // Using wildcard and lowercase for case-insensitive matching
				});
			}

			const command = new DescribeInstancesCommand({
				Filters: combinedFilters,
			});

			const response = await ec2Client.send(command);

			// Flatten instances from reservations and extract only required info
			const filteredInstances: {
				name: string | null;
				instanceType: string | null;
				instanceId: string | null;
				projectTag: string | null;
				maintainerTag: string | null;
			}[] = [];

			if (response.Reservations) {
				for (const reservation of response.Reservations) {
					if (reservation.Instances) {
						for (const instance of reservation.Instances) {
							// Extract instance name from Tags
							let name: string | null = null;
							let projectTag: string | null = null;
							let maintainerTag: string | null = null;

							// Find the Name tag
							name =
								instance.Tags?.find((tag) => tag.Key === "Name")?.Value || null;

							// Find Project/project tag
							projectTag =
								instance.Tags?.find(
									(tag) => tag.Key === "Project" || tag.Key === "project",
								)?.Value || null;

							// Find Maintainer/maintainer tag
							maintainerTag =
								instance.Tags?.find(
									(tag) => tag.Key === "Maintainer" || tag.Key === "maintainer",
								)?.Value || null;

							filteredInstances.push({
								name,
								instanceType: instance.InstanceType || null,
								instanceId: instance.InstanceId || null,
								projectTag,
								maintainerTag,
							});
						}
					}
				}
			}
			return filteredInstances;
		} catch (error) {
			console.error("Error getting EC2 instances:", error);
			throw error;
		}
	}

	/**
	 * Gets instance details by instance ID
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param instanceId The EC2 instance ID
	 * @returns Promise containing the instance details or null if not found
	 */
	async getInstanceById(
		region: string,
		instanceId: string,
	): Promise<Instance | null> {
		try {
			// Create a new EC2Client for each call with the provided region
			const ec2Client = new EC2Client({ region });

			const command = new DescribeInstancesCommand({
				InstanceIds: [instanceId],
			});

			const response = await ec2Client.send(command);

			if (
				response.Reservations &&
				response.Reservations.length > 0 &&
				response.Reservations[0].Instances &&
				response.Reservations[0].Instances.length > 0
			) {
				return response.Reservations[0].Instances[0];
			}

			return null;
		} catch (error) {
			console.error(`Error getting EC2 instance ${instanceId}:`, error);
			throw error;
		}
	}
}

export default new GetInstancesService();
