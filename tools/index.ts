console.log("Hello via Bun!");

// EC2 Services
import getInstancesService from "./service/EC2/getInstances.service";
import launchInstanceService from "./service/EC2/launchInstance.service";

// ElastiCache Services
import describeCacheClustersService from "./service/ElastiCache/describeCacheClusters.service";
import createCacheClusterService from "./service/ElastiCache/createCacheCluster.service";
import deleteCacheClusterService from "./service/ElastiCache/deleteCacheCluster.service";
import modifyCacheClusterService from "./service/ElastiCache/modifyCacheCluster.service";
import describeReplicationGroupsService from "./service/ElastiCache/describeReplicationGroups.service";
import createReplicationGroupService from "./service/ElastiCache/createReplicationGroup.service";
import deleteReplicationGroupService from "./service/ElastiCache/deleteReplicationGroup.service";
import createSnapshotService from "./service/ElastiCache/createSnapshot.service";

// Billing Services
import createBudgetService from "./service/Billing/createBudget.service";

// RDS Services
import listDbInstancesService from "./service/RDS/listDbInstances.service";
import describeDbInstanceService from "./service/RDS/describeDbInstance.service";
import createDbInstanceService from "./service/RDS/createDbInstance.service";
import deleteDbInstanceService from "./service/RDS/deleteDbInstance.service";
import listDbClustersService from "./service/RDS/listDbClusters.service";
import describeDbClusterService from "./service/RDS/describeDbCluster.service";
import createDbClusterService from "./service/RDS/createDbCluster.service";
import deleteDbClusterService from "./service/RDS/deleteDbCluster.service";
import createDbClusterSnapshotService from "./service/RDS/createDbClusterSnapshot.service";
import restoreDbClusterFromSnapshotService from "./service/RDS/restoreDbClusterFromSnapshot.service";
import createDbSnapshotService from "./service/RDS/createDbSnapshot.service";
import restoreDbInstanceFromDbSnapshotService from "./service/RDS/restoreDbInstanceFromDbSnapshot.service";

// Route53 Services
import listHostedZonesService from "./service/Route53/listHostedZones.service";
import getHostedZoneService from "./service/Route53/getHostedZone.service";
import createHostedZoneService from "./service/Route53/createHostedZone.service";
import deleteHostedZoneService from "./service/Route53/deleteHostedZone.service";
import listResourceRecordSetsService from "./service/Route53/listResourceRecordSets.service";
import changeResourceRecordSetsService from "./service/Route53/changeResourceRecordSets.service";
import getChangeService from "./service/Route53/getChange.service";
import listReusableDelegationSetsService from "./service/Route53/listReusableDelegationSets.service";
import getReusableDelegationSetService from "./service/Route53/getReusableDelegationSet.service";

// ACM Services
import listCertificatesService from "./service/ACM/listCertificates.service";
import describeCertificateService from "./service/ACM/describeCertificate.service";
import requestCertificateService from "./service/ACM/requestCertificate.service";
import deleteCertificateService from "./service/ACM/deleteCertificate.service";
import importCertificateService from "./service/ACM/importCertificate.service";
import addTagsToCertificateService from "./service/ACM/addTagsToCertificate.service";
import removeTagsFromCertificateService from "./service/ACM/removeTagsFromCertificate.service";

// S3 Services
import listBucketsService from "./service/S3/listBuckets.service";
import createBucketService from "./service/S3/createBucket.service";
import deleteBucketService from "./service/S3/deleteBucket.service";
import listObjectsService from "./service/S3/listObjects.service";
import uploadFileService from "./service/S3/uploadFile.service";
import downloadFileService from "./service/S3/downloadFile.service";
import deleteObjectService from "./service/S3/deleteObject.service";
import deleteObjectsService from "./service/S3/deleteObjects.service";
import enableVersioningService from "./service/S3/enableVersioning.service";
import disableVersioningService from "./service/S3/disableVersioning.service";
import getBucketVersioningService from "./service/S3/getBucketVersioning.service";
import getBucketAclService from "./service/S3/getBucketAcl.service";
import setBucketAclService from "./service/S3/setBucketAcl.service";

// SQS Services
import listQueuesService from "./service/SQS/listQueues.service";
import getQueueUrlService from "./service/SQS/getQueueUrl.service";
import getQueueAttributesService from "./service/SQS/getQueueAttributes.service";
import createQueueService from "./service/SQS/createQueue.service";
import deleteQueueService from "./service/SQS/deleteQueue.service";
import sendMessageService from "./service/SQS/sendMessage.service";
import receiveMessageService from "./service/SQS/receiveMessage.service";
import deleteMessageService from "./service/SQS/deleteMessage.service";
import deleteMessageBatchService from "./service/SQS/deleteMessageBatch.service";
import purgeQueueService from "./service/SQS/purgeQueue.service";
import setQueueAttributesService from "./service/SQS/setQueueAttributes.service";
import getQueuePolicyService from "./service/SQS/getQueuePolicy.service";
import setQueuePolicyService from "./service/SQS/setQueuePolicy.service";
import addPermissionService from "./service/SQS/addPermission.service";
import removePermissionService from "./service/SQS/removePermission.service";
import listDeadLetterSourceQueuesService from "./service/SQS/listDeadLetterSourceQueues.service";
import type BaseService from "./service/base.service";
const tools: BaseService[] = [
	getInstancesService,
	launchInstanceService,
	// ElastiCache
	describeCacheClustersService,
	createCacheClusterService,
	deleteCacheClusterService,
	modifyCacheClusterService,
	describeReplicationGroupsService,
	createReplicationGroupService,
	deleteReplicationGroupService,
	createSnapshotService,
	// Billing
	createBudgetService,
	// RDS
	listDbInstancesService,
	describeDbInstanceService,
	createDbInstanceService,
	deleteDbInstanceService,
	listDbClustersService,
	describeDbClusterService,
	createDbClusterService,
	deleteDbClusterService,
	createDbClusterSnapshotService,
	restoreDbClusterFromSnapshotService,
	createDbSnapshotService,
	restoreDbInstanceFromDbSnapshotService,
	// Route53
	listHostedZonesService,
	getHostedZoneService,
	createHostedZoneService,
	deleteHostedZoneService,
	listResourceRecordSetsService,
	changeResourceRecordSetsService,
	getChangeService,
	listReusableDelegationSetsService,
	getReusableDelegationSetService,
	// ACM
	listCertificatesService,
	describeCertificateService,
	requestCertificateService,
	deleteCertificateService,
	importCertificateService,
	addTagsToCertificateService,
	removeTagsFromCertificateService,
	// S3
	listBucketsService,
	createBucketService,
	deleteBucketService,
	listObjectsService,
	uploadFileService,
	downloadFileService,
	deleteObjectService,
	deleteObjectsService,
	enableVersioningService,
	disableVersioningService,
	getBucketVersioningService,
	getBucketAclService,
	setBucketAclService,
	// SQS
	listQueuesService,
	getQueueUrlService,
	getQueueAttributesService,
	createQueueService,
	deleteQueueService,
	sendMessageService,
	receiveMessageService,
	deleteMessageService,
	deleteMessageBatchService,
	purgeQueueService,
	setQueueAttributesService,
	getQueuePolicyService,
	setQueuePolicyService,
	addPermissionService,
	removePermissionService,
	listDeadLetterSourceQueuesService,
];
export default tools;
