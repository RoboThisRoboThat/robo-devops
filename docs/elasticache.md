# Prompt for Building Detailed AWS ElastiCache Management Tools

## Tool: ElastiCache Management Tool (`aws-elasticache-manager`)

### Description

The `aws-elasticache-manager` tool is designed to provide comprehensive management capabilities for AWS ElastiCache clusters and replication groups (for Redis). It allows users to perform a wide range of actions, from listing and describing clusters and replication groups to creating, modifying, deleting, and managing nodes, security groups, and snapshots. This tool aims to simplify the interaction with ElastiCache, making it easier to manage your in-memory caching infrastructure in the cloud.

### Subcommands and Parameters

1.  **`describe-cache-clusters`**: Retrieves a detailed list of ElastiCache clusters.

    * **Description**: This subcommand fetches all ElastiCache clusters associated with your AWS account in a specified region.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`).
        * `--cache-cluster-id` (optional): Filters the results to include only the cluster with the specified ID.
        * `--show-cache-node-info` (optional, default: `false`): If `true`, includes detailed information about each cache node in the cluster.
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

2.  **`create-cache-cluster`**: Creates a new ElastiCache cluster.

    * **Description**: This subcommand allows users to define and create a new ElastiCache cluster.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the cluster.
        * `--cache-cluster-id` (required): The unique identifier for the new cache cluster (e.g., `my-new-cache`).
        * `--cache-node-type` (required): The compute and memory capacity of the cache nodes (e.g., `cache.t2.micro`, `cache.m5.large`).
        * `--engine` (required): The name of the cache engine to be used for this cache cluster (`memcached` or `redis`).
        * `--engine-version` (optional): The version number of the cache engine to use.
        * `--num-cache-nodes` (required): The initial number of cache nodes that the cache cluster will have.
        * `--preferred-availability-zone` (optional): The EC2 Availability Zone (AZ) in which the cache cluster will be created.
        * `--cache-subnet-group-name` (optional): The name of the cache subnet group to use for the cache cluster. Required if the cluster will be in a VPC.
        * `--vpc-security-group-ids` (optional): A list of VPC security group IDs to associate with the cache cluster.
        * `--preferred-maintenance-window` (optional): The weekly time range during which system maintenance can occur.
        * `--port` (optional, default: engine-specific): The port number on which each of the cache nodes will accept connections.
        * `--notification-topic-arn` (optional): The ARN of the Amazon SNS topic to which notifications will be sent.
        * `--security-group-names` (optional): A list of EC2 security group names to associate with this cache cluster (for non-VPC environments).
        * `--az-mode` (optional): Specifies whether the nodes in this Memcached cluster are created in a single Availability Zone or created across multiple Availability Zones in the cluster's region. Valid values: `single-az`, `multi-az`.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new cache cluster.

3.  **`delete-cache-cluster`**: Deletes a specified ElastiCache cluster.

    * **Description**: This subcommand permanently removes an ElastiCache cluster. You can optionally request a final snapshot before deletion.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the cluster resides.
        * `--cache-cluster-id` (required): The unique identifier for the cache cluster to delete.
        * `--final-snapshot-identifier` (optional): The identifier of the final snapshot to be created before the cache cluster is deleted.
        * `--show-progress` (optional, default: `false`): If `true`, displays the progress of the deletion.

4.  **`modify-cache-cluster`**: Modifies the settings of an existing ElastiCache cluster.

    * **Description**: This subcommand allows users to change various settings of an existing ElastiCache cluster.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the cluster resides.
        * `--cache-cluster-id` (required): The unique identifier for the cache cluster to modify.
        * `--num-cache-nodes` (optional): The new number of cache nodes for the cluster.
        * `--cache-node-type` (optional): The new compute and memory capacity of the cache nodes.
        * `--engine-version` (optional): The new version number of the cache engine to use.
        * `--preferred-maintenance-window` (optional): The new weekly maintenance window.
        * `--notification-topic-arn` (optional): The new ARN of the SNS topic for notifications.
        * `--security-group-names-to-add` (optional): A list of EC2 security group names to add.
        * `--security-group-names-to-remove` (optional): A list of EC2 security group names to remove.
        * `--apply-immediately` (optional, default: `false`): Specifies whether the changes should be applied immediately.
        * `--preferred-availability-zone` (optional): The preferred AZ to add new nodes in.
        * `--tags-to-add` (optional): A list of key-value pairs to add as tags.
        * `--tags-to-remove` (optional): A list of tag keys to remove.

5.  **`describe-replication-groups`**: Retrieves a detailed list of ElastiCache replication groups (for Redis).

    * **Description**: This subcommand fetches all ElastiCache replication groups associated with your AWS account in a specified region.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--replication-group-id` (optional): Filters the results to include only the replication group with the specified ID.
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

6.  **`create-replication-group`**: Creates a new ElastiCache replication group (for Redis).

    * **Description**: This subcommand allows users to define and create a new ElastiCache replication group for Redis, often used for high availability.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the replication group.
        * `--replication-group-id` (required): The unique identifier for the new replication group (e.g., `my-redis-ha`).
        * `--replication-group-description` (required): A description for the replication group.
        * `--primary-cluster-id` (optional): The cluster ID of the primary node in the replication group. Required if creating from an existing cluster.
        * `--num-node-groups` (optional, default: `1`): The number of node groups (shards) for Redis clusters in cluster mode.
        * `--nodes-per-node-group` (optional, default: `1`): The number of nodes per node group (including the primary and replicas).
        * `--cache-node-type` (required): The compute and memory capacity of the cache nodes.
        * `--engine` (required, must be `redis`): The name of the cache engine (must be `redis`).
        * `--engine-version` (optional): The version number of the Redis engine to use.
        * `--preferred-cache-cluster-a-zs` (optional): A list of AZs in which the cache nodes will be created.
        * `--cache-subnet-group-name` (optional): The name of the cache subnet group to use.
        * `--vpc-security-group-ids` (optional): A list of VPC security group IDs to associate with the replication group.
        * `--preferred-maintenance-window` (optional): The weekly maintenance window.
        * `--port` (optional, default: `6379`): The port number on which each of the cache nodes will accept connections.
        * `--automatic-failover-enabled` (optional, default: `true`): Specifies whether automatic failover is enabled.
        * `--multi-az` (optional): Specifies whether to create the replication group with nodes in multiple AZs.
        * `--snapshot-arns` (optional): A list of snapshot ARNs from which to create the replication group.
        * `--snapshot-name` (optional): The name of a snapshot from which to create the replication group.
        * `--tags` (optional): A list of key-value pairs to assign as tags.

7.  **`delete-replication-group`**: Deletes a specified ElastiCache replication group (for Redis).

    * **Description**: This subcommand permanently removes an ElastiCache replication group and all its associated clusters. You can optionally request a final snapshot.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the replication group resides.
        * `--replication-group-id` (required): The unique identifier for the replication group to delete.
        * `--final-snapshot-identifier` (optional): The identifier of the final snapshot to be created.
        * `--retain-primary-cluster` (optional, default: `false`): If `true`, only removes the replicas, retaining the primary.

8.  **`modify-replication-group`**: Modifies the settings of an existing ElastiCache replication group (for Redis).

    * **Description**: This subcommand allows users to change various settings of an existing Redis replication group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the replication group resides.
        * `--replication-group-id` (required): The unique identifier for the replication group to modify.
        * `--replication-group-description` (optional): The new description for the replication group.
        * `--num-node-groups` (optional): The new number of node groups.
        * `--nodes-per-node-group` (optional): The new number of nodes per node group.
        * `--cache-node-type` (optional): The new cache node type.
        * `--engine-version` (optional): The new engine version.
        * `--preferred-maintenance-window` (optional): The new maintenance window.
        * `--notification-topic-arn` (optional): The new SNS topic ARN.
        * `--automatic-failover-enabled` (optional): Enables or disables automatic failover.
        * `--apply-immediately` (optional): Specifies whether to apply changes immediately.
        * `--security-group-ids-to-add` (optional): VPC security group IDs to add.
        * `--security-group-ids-to-remove` (optional): VPC security group IDs to remove.
        * `--tags-to-add` (optional): Tags to add.
        * `--tags-to-remove` (optional): Tag keys to remove.

9.  **`create-snapshot`**: Creates a manual snapshot of a cache cluster or replication group.

    * **Description**: This subcommand allows users to create a manual backup of their ElastiCache data.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--snapshot-name` (required): The identifier for the snapshot.
        * `--cache-cluster-id` (optional): The ID of the cache cluster to snapshot.
        * `--replication-group-id` (optional): The ID of the replication group to snapshot. (Only one of `--cache-cluster-id` or `--replication-group-id` should be specified).
        * `--tags` (optional): Tags to assign to the snapshot.

10. **`describe-snapshots`**: Retrieves a list of ElastiCache snapshots.

    * **Description**: This subcommand fetches information about existing ElastiCache snapshots.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--snapshot-name` (optional): Filters by snapshot name.
        * `--cache-cluster-id` (optional): Filters by the ID of the source cache cluster.
        * `--replication-group-id` (optional): Filters by the ID of the source replication group.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

11. **`restore-cache-cluster`**: Creates a new cache cluster from an existing snapshot.

    * **Description**: This subcommand allows users to create a new ElastiCache cluster by restoring from a snapshot.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--cache-cluster-id` (required): The identifier for the new cache cluster.
        * `--snapshot-name` (required): The name of the snapshot to restore from.
        * `--cache-node-type` (optional): The cache node type for the restored cluster.
        * `--preferred-availability-zone` (optional): The AZ for the restored cluster.
        * `--cache-subnet-group-name` (optional): The subnet group for the restored cluster (if in VPC).
        * `--vpc-security-group-ids` (optional): VPC security groups for the restored cluster.
        * `--port` (optional): The port for the restored cluster.

12. **`describe-cache-subnet-groups`**: Retrieves a list of ElastiCache cache subnet groups.

    * **Description**: This subcommand fetches information about existing cache subnet groups.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--cache-subnet-group-name` (optional): Filters by subnet group name.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

13. **`create-cache-subnet-group`**: Creates a new ElastiCache cache subnet group.

    * **Description**: This subcommand allows users to create a new subnet group for their ElastiCache clusters in a VPC.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--cache-subnet-group-name` (required): The name for the subnet group.
        * `--cache-subnet-group-description` (required): A description for the subnet group.
        * `--subnet-ids` (required): A list of VPC subnet IDs to include in the group.

14. **`delete-cache-subnet-group`**: Deletes a specified ElastiCache cache subnet group.

    * **Description**: This subcommand permanently removes a cache subnet group. **Note:** The subnet group must not be associated with any clusters.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--cache-subnet-group-name` (required): The name of the subnet group to delete.

15. **`describe-cache-security-groups`**: Retrieves a list of ElastiCache cache security groups (for non-VPC).

    * **Description**: This subcommand fetches information about existing cache security groups.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--cache-security-group-name` (optional): Filters by security group name.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

16. **`authorize-cache-security-group-ingress`**: Adds an EC2 security group to an ElastiCache cache security group.

    * **Description**: This subcommand allows users to authorize access to their ElastiCache cluster from an EC2 security group (for non-VPC).
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--cache-security-group-name` (required): The name of the cache security group to modify.
        * `--ec2-security-group-name` (required): The name of the EC2 security group to authorize.
        * `--ec2-security-group-owner-id` (required): The AWS account ID of the owner of the EC2 security group.

17. **`revoke-cache-security-group-ingress`**: Removes an EC2 security group from an ElastiCache cache security group.

    * **Description**: This subcommand allows users to revoke access to their ElastiCache cluster from an EC2 security group (for non-VPC).
    * **Parameters**:
        * `--region` (required): Specifies the AWS region.
        * `--cache-security-group-name` (required): The name of the cache security group to modify.
        * `--ec2-security-group-name` (required): The name of the EC2 security group to revoke.
        * `--ec2-security-group-owner-id` (required): The AWS account ID of the owner of the EC2 security group.