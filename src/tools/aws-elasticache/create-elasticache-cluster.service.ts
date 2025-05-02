import { ElastiCache } from "aws-sdk";
import { CreateElastiCacheClusterParams } from "./create-elasticache-cluster";

export class CreateElastiCacheClusterService {
	async execute(params: CreateElastiCacheClusterParams): Promise<any> {
		const {
			region,
			clusterId,
			nodeType,
			engine,
			numNodes,
			engineVersion,
			port,
			parameterGroupName,
			subnetGroupName,
			securityGroupIds,
			tags,
		} = params;

		// Initialize the ElastiCache client with the specified region
		const elastiCache = new ElastiCache({ region });

		// Build the request parameters
		const requestParams: ElastiCache.CreateCacheClusterMessage = {
			CacheClusterId: clusterId,
			CacheNodeType: nodeType,
			Engine: engine,
			NumCacheNodes: numNodes,
			Tags: tags,
		};

		// Add optional parameters if provided
		if (engineVersion) requestParams.EngineVersion = engineVersion;
		if (port) requestParams.Port = port;
		if (parameterGroupName)
			requestParams.CacheParameterGroupName = parameterGroupName;
		if (subnetGroupName) requestParams.CacheSubnetGroupName = subnetGroupName;
		if (securityGroupIds && securityGroupIds.length > 0) {
			requestParams.SecurityGroupIds = securityGroupIds;
		}

		try {
			// Call the AWS SDK to create the ElastiCache cluster
			const response = await elastiCache
				.createCacheCluster(requestParams)
				.promise();

			// Return the created cluster information
			return {
				cluster: {
					clusterId: response.CacheCluster?.CacheClusterId,
					status: response.CacheCluster?.CacheClusterStatus,
					engine: response.CacheCluster?.Engine,
					engineVersion: response.CacheCluster?.EngineVersion,
					nodeType: response.CacheCluster?.CacheNodeType,
					numNodes: response.CacheCluster?.NumCacheNodes,
					created: response.CacheCluster?.CacheClusterCreateTime,
					securityGroups: response.CacheCluster?.SecurityGroups?.map(
						(sg) => sg.SecurityGroupId,
					),
					subnetGroupName: response.CacheCluster?.CacheSubnetGroupName,
				},
				region,
			};
		} catch (error) {
			console.error("Error creating ElastiCache cluster:", error);
			throw error;
		}
	}
}
