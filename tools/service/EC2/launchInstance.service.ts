import {
	EC2Client,
	RunInstancesCommand,
	CreateTagsCommand,
	CreateSecurityGroupCommand,
	AuthorizeSecurityGroupIngressCommand,
	DescribeSubnetsCommand,
	DescribeImagesCommand,
	type Instance,
	type _InstanceType,
} from "@aws-sdk/client-ec2";
import { z } from "zod";
import BaseService from "../base.service";
class LaunchInstanceService {
	/**
	 * Launches a new EC2 instance with the specified parameters
	 * @param region The AWS region to use (e.g., 'us-east-1', 'us-west-2')
	 * @param imageId Optional AMI ID to use for the instance. If not provided, a default Amazon Linux 2 image will be used
	 * @param instanceType The instance type to launch
	 * @param keyName Optional SSH key name to use
	 * @param securityGroupIds Optional security group IDs to assign. If not provided, a new security group will be created
	 * @param subnetId Optional subnet ID to launch the instance in. If not provided, default subnet will be used
	 * @param tags Optional tags to apply to the instance
	 * @param createDefaultSecurityGroup Whether to create a default security group if securityGroupIds is empty
	 * @returns Promise containing the launched instance details
	 */

	toolName = "launch-ec2-instance";
	description =
		"Launch a new EC2 instance in a specific AWS region with smart defaults";
	launchInstanceInput = {
		region: z.string().describe("AWS region (e.g., us-east-1, us-west-2)"),
		imageId: z
			.string()
			.optional()
			.describe(
				"AMI ID to use for the instance. If not provided, a default Amazon Linux 2 image will be used",
			),
		instanceType: z
			.string()
			.describe("Instance type (e.g., t2.micro, t3.small)"),
		keyName: z.string().optional().describe("SSH key name to use"),
		securityGroupIds: z
			.array(z.string())
			.optional()
			.describe(
				"Array of security group IDs. If not provided, a default security group will be created",
			),
		subnetId: z
			.string()
			.optional()
			.describe(
				"Subnet ID to launch the instance in. If not provided, default subnet will be used",
			),
		tags: z
			.array(
				z.object({
					Key: z.string().describe("Tag key (e.g., 'Name', 'Project')"),
					Value: z.string().describe("Tag value"),
				}),
			)
			.optional()
			.describe("Tags to apply to the instance"),
		createDefaultSecurityGroup: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether to create a default security group if securityGroupIds is empty",
			),
	};
	launchInstanceZodInput = z.object(this.launchInstanceInput);

	/**
	 * Creates a default security group with SSH access
	 * @param ec2Client The EC2 client to use
	 * @param vpcId The VPC ID to create the security group in
	 * @returns Promise containing the security group ID
	 */
	private async createDefaultSecurityGroup(
		ec2Client: EC2Client,
		vpcId: string,
	): Promise<string> {
		// Create a security group
		const groupName = `ec2-launch-${Date.now()}`;
		const createSecurityGroupResponse = await ec2Client.send(
			new CreateSecurityGroupCommand({
				GroupName: groupName,
				Description: "Created automatically by LaunchInstanceService",
				VpcId: vpcId,
			}),
		);

		const securityGroupId = createSecurityGroupResponse.GroupId;
		if (!securityGroupId) {
			throw new Error("Failed to create security group");
		}

		// Allow SSH access
		await ec2Client.send(
			new AuthorizeSecurityGroupIngressCommand({
				GroupId: securityGroupId,
				IpPermissions: [
					{
						IpProtocol: "tcp",
						FromPort: 22,
						ToPort: 22,
						IpRanges: [
							{
								CidrIp: "0.0.0.0/0",
								Description: "Allow SSH access",
							},
						],
					},
				],
			}),
		);

		return securityGroupId;
	}

	/**
	 * Gets a default subnet in the specified region
	 * @param ec2Client The EC2 client to use
	 * @returns Promise containing the subnet ID and VPC ID
	 */
	private async getDefaultSubnet(
		ec2Client: EC2Client,
	): Promise<{ subnetId: string; vpcId: string }> {
		const describeSubnetsResponse = await ec2Client.send(
			new DescribeSubnetsCommand({
				Filters: [
					{
						Name: "default-for-az",
						Values: ["true"],
					},
				],
			}),
		);

		if (
			!describeSubnetsResponse.Subnets ||
			describeSubnetsResponse.Subnets.length === 0
		) {
			throw new Error("No default subnets found");
		}

		// Use the first default subnet
		const subnet = describeSubnetsResponse.Subnets[0];
		if (!subnet.SubnetId || !subnet.VpcId) {
			throw new Error("Invalid subnet information");
		}

		return {
			subnetId: subnet.SubnetId,
			vpcId: subnet.VpcId,
		};
	}

	/**
	 * Gets a default Amazon Linux 2 image in the specified region
	 * @param ec2Client The EC2 client to use
	 * @returns Promise containing the image ID
	 */
	private async getDefaultAmiId(ec2Client: EC2Client): Promise<string> {
		// Look for the latest Amazon Linux 2 image owned by Amazon
		const describeImagesResponse = await ec2Client.send(
			new DescribeImagesCommand({
				Filters: [
					{
						Name: "name",
						Values: ["amzn2-ami-hvm-*-x86_64-gp2"],
					},
					{
						Name: "state",
						Values: ["available"],
					},
					{
						Name: "owner-alias",
						Values: ["amazon"],
					},
				],
			}),
		);

		if (
			!describeImagesResponse.Images ||
			describeImagesResponse.Images.length === 0
		) {
			throw new Error("No default Amazon Linux 2 images found");
		}

		// Sort by creation date to get the latest
		const sortedImages = describeImagesResponse.Images.sort((a, b) => {
			const dateA = a.CreationDate ? new Date(a.CreationDate).getTime() : 0;
			const dateB = b.CreationDate ? new Date(b.CreationDate).getTime() : 0;
			return dateB - dateA;
		});

		const latestImage = sortedImages[0];
		if (!latestImage.ImageId) {
			throw new Error("Invalid image information");
		}

		return latestImage.ImageId;
	}

	async launchInstance({
		region,
		imageId,
		instanceType,
		keyName,
		securityGroupIds = [],
		subnetId,
		tags = [],
		createDefaultSecurityGroup = true,
	}: {
		region: string;
		imageId?: string;
		instanceType: string;
		keyName?: string;
		securityGroupIds?: string[];
		subnetId?: string;
		tags?: { Key: string; Value: string }[];
		createDefaultSecurityGroup?: boolean;
	}): Promise<{
		instanceId: string | null;
		publicDnsName: string | null;
		publicIpAddress: string | null;
		privateIpAddress: string | null;
		state: string | null;
		securityGroupId?: string;
	}> {
		try {
			// Create a new EC2Client with the provided region
			const ec2Client = new EC2Client({ region });
			let actualImageId = imageId;
			let actualSecurityGroupIds = [...securityGroupIds];
			let actualSubnetId = subnetId;
			let createdSecurityGroupId: string | undefined;
			let vpcId: string;

			// Get default subnet if not provided
			if (!actualSubnetId) {
				const subnetInfo = await this.getDefaultSubnet(ec2Client);
				actualSubnetId = subnetInfo.subnetId;
				vpcId = subnetInfo.vpcId;
			} else {
				// We need to get the VPC ID for the provided subnet
				const describeSubnetsResponse = await ec2Client.send(
					new DescribeSubnetsCommand({
						SubnetIds: [actualSubnetId],
					}),
				);

				if (
					!describeSubnetsResponse.Subnets ||
					describeSubnetsResponse.Subnets.length === 0 ||
					!describeSubnetsResponse.Subnets[0].VpcId
				) {
					throw new Error("Invalid subnet information");
				}

				vpcId = describeSubnetsResponse.Subnets[0].VpcId;
			}

			// Create a default security group if requested and no security groups provided
			if (createDefaultSecurityGroup && actualSecurityGroupIds.length === 0) {
				createdSecurityGroupId = await this.createDefaultSecurityGroup(
					ec2Client,
					vpcId,
				);
				actualSecurityGroupIds = [createdSecurityGroupId];
			}

			// Get default AMI if not provided
			if (!actualImageId) {
				actualImageId = await this.getDefaultAmiId(ec2Client);
			}

			// Prepare the command to launch an instance
			const runInstancesCommand = new RunInstancesCommand({
				ImageId: actualImageId,
				InstanceType: instanceType as _InstanceType,
				KeyName: keyName,
				SecurityGroupIds:
					actualSecurityGroupIds.length > 0
						? actualSecurityGroupIds
						: undefined,
				SubnetId: actualSubnetId,
				MinCount: 1,
				MaxCount: 1,
			});

			// Launch the instance
			const runInstancesResponse = await ec2Client.send(runInstancesCommand);

			// Check if the instance was launched
			if (
				!runInstancesResponse.Instances ||
				runInstancesResponse.Instances.length === 0
			) {
				throw new Error("Failed to launch EC2 instance");
			}

			const instance = runInstancesResponse.Instances[0];
			const instanceId = instance.InstanceId;

			// Add tags if provided and instance ID exists
			if (instanceId && tags.length > 0) {
				const createTagsCommand = new CreateTagsCommand({
					Resources: [instanceId],
					Tags: tags,
				});

				await ec2Client.send(createTagsCommand);
			}

			// Return instance details
			return {
				instanceId: instance.InstanceId || null,
				publicDnsName: instance.PublicDnsName || null,
				publicIpAddress: instance.PublicIpAddress || null,
				privateIpAddress: instance.PrivateIpAddress || null,
				state: instance.State?.Name || null,
				securityGroupId: createdSecurityGroupId,
			};
		} catch (error) {
			console.error("Error launching EC2 instance:", error);
			throw error;
		}
	}
}

const launchInstanceService = new LaunchInstanceService();

export default new BaseService(
	launchInstanceService.toolName,
	launchInstanceService.description,
	launchInstanceService.launchInstanceInput,
	launchInstanceService.launchInstanceZodInput,
	launchInstanceService.launchInstance,
);
