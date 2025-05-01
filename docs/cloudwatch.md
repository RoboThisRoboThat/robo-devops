# Prompt for Building Detailed AWS CloudWatch Management Tools

## Tool: CloudWatch Management Tool (`aws-cloudwatch-manager`)

### Description

The `aws-cloudwatch-manager` tool is designed to provide comprehensive management capabilities for AWS CloudWatch resources, including metrics, alarms, logs, and dashboards. It allows users to perform a wide range of actions, from listing and describing these resources to creating, updating, and deleting them, as well as retrieving metric data and log events. This tool aims to simplify the interaction with CloudWatch, making it easier to monitor and manage the health and performance of your AWS infrastructure and applications.

### Subcommands and Parameters

1.  **`list-metrics`**: Retrieves a detailed list of available CloudWatch metrics.

    * **Description**: This subcommand fetches all CloudWatch metrics based on specified namespaces and optional filters.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`).
        * `--namespace` (optional): Filters the results to include only metrics from the specified namespace (e.g., `AWS/EC2`, `AWS/RDS`).
        * `--metric-name` (optional): Filters the results to include only metrics with the specified name (e.g., `CPUUtilization`, `DatabaseConnections`).
        * `--dimensions` (optional): A JSON string or a path to a JSON file specifying dimensions to filter the metrics by (e.g., `'[{"Name": "InstanceId", "Value": "i-0abcdef1234567890"}]'`).
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

2.  **`get-metric-data`**: Retrieves time series data for one or more CloudWatch metrics.

    * **Description**: This subcommand fetches historical data points for specified metrics within a given time range.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--metric-data-queries` (required): A JSON string or a path to a JSON file defining the metrics to retrieve data for. Each query should specify the metric name, namespace, dimensions, start time, end time, period, and statistics. Consult the AWS CloudWatch API documentation for the query structure. Example: `'[{"Id": "m1", "MetricStat": {"Metric": {"Namespace": "AWS/EC2", "MetricName": "CPUUtilization", "Dimensions": [{"Name": "InstanceId", "Value": "i-0abcdef1234567890"}]}, "Period": 60, "Stat": "Average"}, "ReturnData": true}]'`.
        * `--start-time` (required): The start of the time range to retrieve data from, in ISO 8601 format (e.g., `2025-05-01T00:00:00Z`).
        * `--end-time` (required): The end of the time range to retrieve data to, in ISO 8601 format (e.g., `2025-05-01T17:00:00Z`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

3.  **`list-alarms`**: Retrieves a detailed list of CloudWatch alarms.

    * **Description**: This subcommand fetches all CloudWatch alarms in a specified region based on optional filters.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--alarm-names` (optional): A comma-separated list of alarm names to retrieve.
        * `--state-value` (optional): Filters the results by the state of the alarm (`OK`, `ALARM`, `INSUFFICIENT_DATA`).
        * `--action-prefix` (optional): Filters the results by an action prefix.
        * `--alarm-name-prefix` (optional): Filters the results by a name prefix.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

4.  **`describe-alarm`**: Displays detailed information about a specific CloudWatch alarm.

    * **Description**: This subcommand retrieves and shows all configuration details of a given CloudWatch alarm.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the alarm resides.
        * `--alarm-name` (required): The name of the CloudWatch alarm to describe (e.g., `HighCPUUtilization`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

5.  **`create-alarm`**: Creates a new CloudWatch alarm.

    * **Description**: This subcommand allows users to define and create a new CloudWatch alarm to monitor a specific metric.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the alarm.
        * `--alarm-name` (required): The name of the new CloudWatch alarm (e.g., `LowDiskSpace`).
        * `--metric-name` (required): The name of the metric to monitor (e.g., `DiskSpaceUtilization`).
        * `--namespace` (required): The namespace of the metric (e.g., `AWS/EC2`).
        * `--statistic` (required): The statistic to apply to the metric (`SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`, `pXX.XX`).
        * `--dimensions` (optional): A JSON string or a path to a JSON file specifying the dimensions for the metric.
        * `--period` (required): The evaluation period for the alarm, in seconds (e.g., `60`).
        * `--evaluation-periods` (required): The number of evaluation periods to consider when assessing the alarm state.
        * `--threshold` (required): The value against which the specified statistic is compared.
        * `--comparison-operator` (required): The arithmetic operation to use when comparing the statistic and threshold (`GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanOrEqualToThreshold`, `LessThanThreshold`, `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, `GreaterThanUpperThreshold`).
        * `--alarm-actions` (optional): A comma-separated list of ARNs for the actions to execute when the alarm enters the `ALARM` state (e.g., SNS topic ARNs).
        * `--ok-actions` (optional): A comma-separated list of ARNs for the actions to execute when the alarm enters the `OK` state.
        * `--insufficient-data-actions` (optional): A comma-separated list of ARNs for the actions to execute when the alarm enters the `INSUFFICIENT_DATA` state.
        * `--unit` (optional): The unit of the metric.
        * `--treat-missing-data` (optional, default: `missing`): Specifies how missing data points are treated (`missing`, `ignore`, `breaching`, `notBreaching`).
        * `--evaluate-low-sample-count-percentile` (optional): Used for percentile statistics to specify how to handle low data sample counts.
        * `--alarm-description` (optional): A description for the alarm.
        * `--actions-enabled` (optional, default: `true`): Indicates whether actions should be executed when the alarm state changes. Boolean value.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new alarm.

6.  **`put-metric-data`**: Publishes metric data points to CloudWatch.

    * **Description**: This subcommand allows users to send custom metric data to CloudWatch.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to publish to.
        * `--namespace` (required): The namespace for the custom metric (e.g., `MyApp/Backend`).
        * `--metric-data` (required): A JSON string or a path to a JSON file defining the metric data points to publish. Each data point should include the metric name, timestamp, value, and optional unit and dimensions. Consult the AWS CloudWatch API documentation for the data point structure. Example: `'[{"MetricName": "RequestLatency", "Timestamp": "2025-05-01T16:00:00Z", "Value": 0.12, "Unit": "Seconds", "Dimensions": [{"Name": "Operation", "Value": "Submit"}]}]'`.

7.  **`delete-alarm`**: Deletes a specified CloudWatch alarm.

    * **Description**: This subcommand permanently removes a CloudWatch alarm.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the alarm resides.
        * `--alarm-name` (required): The name of the CloudWatch alarm to delete.

8.  **`list-log-groups`**: Retrieves a detailed list of CloudWatch Log Groups.

    * **Description**: This subcommand fetches all CloudWatch Log Groups in a specified region based on optional filters.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--log-group-name-prefix` (optional): Filters the results to include only log groups whose names start with the specified prefix.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

9.  **`describe-log-group`**: Displays detailed information about a specific CloudWatch Log Group.

    * **Description**: This subcommand retrieves and shows all configuration details of a given CloudWatch Log Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the log group resides.
        * `--log-group-name` (required): The name of the CloudWatch Log Group to describe (e.g., `/aws/lambda/my-function`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

10. **`create-log-group`**: Creates a new CloudWatch Log Group.

    * **Description**: This subcommand allows users to create a new CloudWatch Log Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the log group.
        * `--log-group-name` (required): The name of the new CloudWatch Log Group (e.g., `/var/log/my-application`).
        * `--kms-key-id` (optional): The Amazon KMS key ID to use for encrypting log data.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new log group.

11. **`delete-log-group`**: Deletes a specified CloudWatch Log Group.

    * **Description**: This subcommand permanently removes a CloudWatch Log Group and all its log streams and events. Use with caution.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the log group resides.
        * `--log-group-name` (required): The name of the CloudWatch Log Group to delete.

12. **`get-log-events`**: Retrieves log events from a specific CloudWatch Log Stream.

    * **Description**: This subcommand fetches log events from a specified CloudWatch Log Stream within a Log Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--log-group-name` (required): The name of the CloudWatch Log Group.
        * `--log-stream-name` (required): The name of the CloudWatch Log Stream to retrieve events from.
        * `--start-time` (optional): The start of the time range to retrieve events from (in milliseconds since the epoch).
        * `--end-time` (optional): The end of the time range to retrieve events to (in milliseconds since the epoch).
        * `--limit` (optional): The maximum number of log events to return.
        * `--start-from-head` (optional, default: `false`): If `true`, the earliest log events are returned first.
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

13. **`list-dashboards`**: Retrieves a list of CloudWatch dashboards.

    * **Description**: This subcommand fetches all CloudWatch dashboards in a specified region.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--dashboard-name-prefix` (optional): Filters the results to include only dashboards whose names start with the specified prefix.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

14. **`get-dashboard`**: Retrieves the details of a specific CloudWatch dashboard.

    * **Description**: This subcommand fetches the JSON structure that defines a CloudWatch dashboard.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the dashboard resides.
        * `--dashboard-name` (required): The name of the CloudWatch dashboard to retrieve (e.g., `MyWebAppDashboard`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

15. **`put-dashboard`**: Creates or updates a CloudWatch dashboard.

    * **Description**: This subcommand allows users to create a new dashboard or update an existing one.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create or update the dashboard.
        * `--dashboard-name` (required): The name of the dashboard to create or update.
        * `--dashboard-body` (required): A JSON string or a path to a JSON file that defines the structure and widgets of the dashboard. Consult the AWS CloudWatch API documentation for the dashboard body syntax.

16. **`delete-dashboard`**: Deletes a specified CloudWatch dashboard.

    * **Description**: This subcommand permanently removes a CloudWatch dashboard.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the dashboard resides.
        * `--dashboard-name` (required): The name of the CloudWatch dashboard to delete.