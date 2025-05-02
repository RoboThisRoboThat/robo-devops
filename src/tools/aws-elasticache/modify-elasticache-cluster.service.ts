import { ElastiCache } from "aws-sdk";
import { ModifyElastiCacheClusterParams } from "./modify-elasticache-cluster";

export class ModifyElastiCacheClusterService {
	async execute(params: ModifyElastiCacheClusterParams): Promise<any> {
		const {
			region,
			clusterId,
			applyImmediately,
			numNodes,
			nodeType,
			engineVersion,
			securityGroupIds,
			parameterGroupName,
			preferredMaintenanceWindow,
			notificationTopicArn,
			autoMinorVersionUpgrade,
		} = params;

		// Initialize the ElastiCache client with the specified region
		const elastiCache = new ElastiCache({ region });

		// Build the request parameters
		const requestParams: ElastiCache.ModifyCacheClusterMessage = {
			CacheClusterId: clusterId,
			ApplyImmediately: applyImmediately,
		};

		// Add optional parameters if provided
		if (numNodes !== undefined) requestParams.NumCacheNodes = numNodes;
		if (nodeType) requestParams.CacheNodeType = nodeType;
		if (engineVersion) requestParams.EngineVersion = engineVersion;
		if (securityGroupIds && securityGroupIds.length > 0) {
			requestParams.SecurityGroupIds = securityGroupIds;
		}
		if (parameterGroupName)
			requestParams.CacheParameterGroupName = parameterGroupName;
		if (preferredMaintenanceWindow)
			requestParams.PreferredMaintenanceWindow = preferredMaintenanceWindow;
		if (notificationTopicArn)
			requestParams.NotificationTopicArn = notificationTopicArn;
		if (autoMinorVersionUpgrade !== undefined)
			requestParams.AutoMinorVersionUpgrade = autoMinorVersionUpgrade;

		try {
			// Call the AWS SDK to modify the ElastiCache cluster
			const response = await elastiCache
				.modifyCacheCluster(requestParams)
				.promise();

			// Return the modified cluster information
			return {
				success: true,
				cluster: {
					clusterId: response.CacheCluster?.CacheClusterId,
					status: response.CacheCluster?.CacheClusterStatus,
					pendingChanges: response.CacheCluster?.PendingModifiedValues,
					applyImmediately,
					message: applyImmediately
						? "Changes are being applied immediately"
						: "Changes will be applied during the next maintenance window",
				},
				region,
			};
		} catch (error) {
			console.error(
				`Error modifying ElastiCache cluster '${clusterId}':`,
				error,
			);
			throw error;
		}
	}
}
