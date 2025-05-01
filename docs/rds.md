# Prompt for Building Detailed AWS RDS Management Tools

## Tool: RDS Management Tool (`aws-rds-manager`)

### Description

The `aws-rds-manager` tool is designed to provide comprehensive management capabilities for Amazon Relational Database Service (RDS) instances, clusters (for Aurora), and related resources. It allows users to perform a wide range of actions, from listing and describing databases to creating, modifying, deleting, backing up, and restoring database instances and clusters. This tool aims to simplify the interaction with RDS, making it easier to manage your relational databases in the cloud.

### Subcommands and Parameters

1.  **`list-db-instances`**: Retrieves and displays a detailed list of RDS DB instances.

    * **Description**: This subcommand fetches all RDS DB instances associated with your AWS account in a specified region and presents their key attributes.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`).
        * `--output-format` (optional): Specifies the desired output format. Supported values could include `text` (default, human-readable text output), `json` (JSON formatted output), or `table` (formatted table output).

2.  **`describe-db-instance`**: Displays detailed information about a specific RDS DB instance.

    * **Description**: This subcommand retrieves and shows all configuration details of a given RDS DB instance.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the DB instance resides.
        * `--db-instance-identifier` (required): Specifies the unique identifier for the DB instance (e.g., `mydbinstance`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

3.  **`create-db-instance`**: Creates a new RDS DB instance with specified configurations.

    * **Description**: This subcommand allows users to define and create a new RDS DB instance.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the DB instance.
        * `--db-instance-identifier` (required): The unique identifier for the DB instance (e.g., `new-database`).
        * `--db-instance-class` (required): The compute and memory capacity of the DB instance (e.g., `db.t2.micro`, `db.m5.large`).
        * `--engine` (required): The name of the database engine to be used for this DB instance (e.g., `mysql`, `postgres`, `oracle-ee`, `sqlserver-ex`).
        * `--engine-version` (optional): The version number of the database engine to use.
        * `--allocated-storage` (required): The size of the database storage to allocate (in GiB).
        * `--db-name` (optional): The name of the database to create when the DB instance is created. Not applicable for all engines.
        * `--master-username` (required): The username for the master user account.
        * `--master-password` (required): The password for the master user account.
        * `--vpc-security-group-ids` (optional): A list of VPC security group IDs to associate with the DB instance.
        * `--availability-zone` (optional): The Availability Zone (AZ) in which to create the DB instance.
        * `--db-subnet-group-name` (optional): The name of the DB subnet group to use for the DB instance. Required if the DB instance will be in a VPC.
        * `--publicly-accessible` (optional, default: `false`): Specifies whether the DB instance can be accessed from outside the VPC. Boolean value (`true` or `false`).
        * `--multi-az` (optional, default: `false`): Specifies if the DB instance should be created as a Multi-AZ deployment for high availability. Boolean value.
        * `--backup-retention-period` (optional, default: engine-specific): The number of days for which automatic backups are retained.
        * `--preferred-backup-window` (optional): The daily time range during which automated backups are created.
        * `--preferred-maintenance-window` (optional): The weekly time range during which system maintenance can occur.
        * `--port` (optional, default: engine-specific): The port number on which the database accepts connections.
        * `--storage-type` (optional, default: `gp2`): The storage type to be associated with the DB instance (`standard`, `gp2`, `io1`).
        * `--iops` (optional): The number of Provisioned IOPS (PIOPS) if `storage-type` is `io1`.
        * `--license-model` (optional): The licensing model to use.
        * `--character-set-name` (optional): The character set for the database.
        * `--collation` (optional): The collation for the database.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new DB instance.

4.  **`delete-db-instance`**: Deletes a specified RDS DB instance.

    * **Description**: This subcommand permanently removes an RDS DB instance. You can optionally create a final snapshot before deletion.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the DB instance resides.
        * `--db-instance-identifier` (required): The unique identifier for the DB instance to delete.
        * `--final-db-snapshot-identifier` (optional): Creates a final DB snapshot with the specified identifier before deleting the DB instance.
        * `--skip-final-snapshot` (optional, default: `false`): Specifies whether to skip the creation of a final DB snapshot. Use with caution.

5.  **`list-db-clusters`**: Retrieves and displays a detailed list of RDS DB clusters (Aurora).

    * **Description**: This subcommand fetches all RDS DB clusters associated with your AWS account in a specified region.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

6.  **`describe-db-cluster`**: Displays detailed information about a specific RDS DB cluster (Aurora).

    * **Description**: This subcommand retrieves and shows all configuration details of a given RDS DB cluster.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the DB cluster resides.
        * `--db-cluster-identifier` (required): Specifies the unique identifier for the DB cluster (e.g., `my-aurora-cluster`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

7.  **`create-db-cluster`**: Creates a new RDS DB cluster (Aurora) with specified configurations.

    * **Description**: This subcommand allows users to define and create a new RDS DB cluster.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the DB cluster.
        * `--db-cluster-identifier` (required): The unique identifier for the DB cluster (e.g., `new-aurora-cluster`).
        * `--engine` (required): The name of the database engine to be used for this DB cluster (e.g., `aurora`, `aurora-mysql`, `aurora-postgresql`).
        * `--engine-version` (optional): The version number of the database engine to use.
        * `--database-name` (optional): The name of the initial database to create when the DB cluster is created.
        * `--master-username` (required): The username for the master user account.
        * `--master-password` (required): The password for the master user account.
        * `--vpc-security-group-ids` (optional): A list of VPC security group IDs to associate with the DB cluster.
        * `--db-subnet-group-name` (required): The name of the DB subnet group to use for the DB cluster.
        * `--availability-zones` (optional): A list of Availability Zones (AZs) in which to create the DB cluster.
        * `--backup-retention-period` (optional, default: engine-specific): The number of days for which automatic backups are retained.
        * `--preferred-backup-window` (optional): The daily time range during which automated backups are created.
        * `--preferred-maintenance-window` (optional): The weekly time range during which system maintenance can occur.
        * `--port` (optional, default: engine-specific): The port number on which the database accepts connections.
        * `--storage-encrypted` (optional, default: `false`): Specifies whether the DB cluster should be encrypted at rest.
        * `--kms-key-id` (optional): The AWS KMS key identifier for encryption.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new DB cluster.

8.  **`delete-db-cluster`**: Deletes a specified RDS DB cluster (Aurora).

    * **Description**: This subcommand permanently removes an RDS DB cluster. You can optionally create a final snapshot of the cluster before deletion.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the DB cluster resides.
        * `--db-cluster-identifier` (required): The unique identifier for the DB cluster to delete.
        * `--final-db-cluster-snapshot-identifier` (optional): Creates a final DB cluster snapshot with the specified identifier before deleting the DB cluster.
        * `--skip-final-snapshot` (optional, default: `false`): Specifies whether to skip the creation of a final DB cluster snapshot. Use with caution.

9.  **`create-db-cluster-snapshot`**: Creates a snapshot of a specified RDS DB cluster (Aurora).

    * **Description**: This subcommand creates a manual snapshot of an RDS DB cluster.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the DB cluster resides.
        * `--db-cluster-identifier` (required): The unique identifier of the source DB cluster.
        * `--db-cluster-snapshot-identifier` (required): The identifier for the new DB cluster snapshot.

10. **`restore-db-cluster-from-snapshot`**: Restores an RDS DB cluster (Aurora) from a snapshot.

    * **Description**: This subcommand creates a new RDS DB cluster by restoring from a DB cluster snapshot.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the restored DB cluster.
        * `--db-cluster-identifier` (required): The unique identifier for the new DB cluster to be created from the snapshot.
        * `--db-cluster-snapshot-identifier` (required): The identifier of the DB cluster snapshot to restore from.
        * `--vpc-security-group-ids` (optional): A list of VPC security group IDs to associate with the restored DB cluster.
        * `--db-subnet-group-name` (optional): The name of the DB subnet group to use for the restored DB cluster.
        * `--port` (optional): The port number on which the database accepts connections.

11. **`create-db-snapshot`**: Creates a snapshot of a specified RDS DB instance.

    * **Description**: This subcommand creates a manual snapshot of an RDS DB instance.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the DB instance resides.
        * `--db-instance-identifier` (required): The unique identifier of the source DB instance.
        * `--db-snapshot-identifier` (required): The identifier for the new DB snapshot.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new DB snapshot.

12. **`restore-db-instance-from-db-snapshot`**: Restores an RDS DB instance from a snapshot.

    * **Description**: This subcommand creates a new RDS DB instance by restoring from a DB instance snapshot.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the restored DB instance.
        * `--db-instance-identifier` (required): The unique identifier for the new DB instance to be created from the snapshot.
        * `--db-snapshot-identifier` (required): The identifier of the DB snapshot to restore from.
        * `--db-instance-class` (optional): The compute and memory capacity of the restored DB instance.
        * `--vpc-security-group-ids` (optional): A list of VPC security group IDs to associate with the restored DB instance.
        * `--db-subnet-group-name` (optional): The name of the DB subnet group to use for the restored DB instance.
        * `--multi-az` (optional): Specifies if the restored DB instance should be a Multi-AZ deployment.
        * `--publicly-accessible` (optional): Specifies whether the restored DB instance can be accessed from outside the VPC.
        * `--port` (optional): The port number on which the database accepts connections.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the restored DB instance.