# Prompt for Building Detailed AWS Target Group and Load Balancer Management Tools

## Tool 1: Target Group Management Tool (`aws-tg-manager`)

### Description

The `aws-tg-manager` tool is designed to provide comprehensive management capabilities for AWS Target Groups within a specified AWS region. It allows users to perform a wide range of actions, from basic listing and description to more advanced operations like creation, target registration/deregistration, and health check configuration updates. This tool aims to simplify the interaction with Elastic Load Balancing (ELB) Target Groups, making it easier to manage the backend targets for your load balancers.

### Subcommands and Parameters

1.  **`list-target-groups`**: Retrieves and displays a detailed list of Target Groups.

    * **Description**: This subcommand fetches all Target Groups within the specified AWS region and presents their key attributes in an organized manner.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`). The tool should validate if the provided region is a valid AWS region.
        * `--vpc-id` (optional): If provided, filters the output to display only Target Groups associated with the specified Virtual Private Cloud (VPC) ID (e.g., `vpc-0abcdef1234567890`).
        * `--name-filter` (optional): Allows filtering the list based on a substring match in the Target Group name. For example, `--name-filter "my-app"` would show Target Groups with "my-app" in their name.
        * `--output-format` (optional): Specifies the desired output format. Supported values could include `text` (default, human-readable text output), `json` (JSON formatted output), or `table` (formatted table output).

2.  **`describe-target-group`**: Displays detailed information about a specific Target Group.

    * **Description**: This subcommand retrieves and shows all configuration details of a given Target Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Target Group resides.
        * `--target-group-identifier` (required): Specifies the Target Group to describe. This can be either the **Target Group ARN** (Amazon Resource Name, e.g., `arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-targets/abcdef1234567890`) or the **Target Group Name** (e.g., `my-targets`). The tool should attempt to resolve by name if an ARN is not provided, but clearly indicate if the name is not unique.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

3.  **`create-target-group`**: Creates a new Target Group with specified configurations.

    * **Description**: This subcommand allows users to define and create a new Target Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Target Group will be created.
        * `--name` (required): The name of the new Target Group (e.g., `backend-pool`). This name must be unique within the VPC. The tool should perform basic validation on the name format.
        * `--protocol` (required): The protocol to use for routing traffic to the targets. Allowed values: `HTTP`, `HTTPS`, `TCP`, `TLS`, `UDP`, `TCP_UDP`. The tool should validate against these allowed values.
        * `--port` (required): The port on which the targets receive traffic (e.g., `80`, `443`). Must be an integer between 1 and 65535.
        * `--vpc-id` (required): The ID of the VPC in which to create the Target Group (e.g., `vpc-0abcdef1234567890`).
        * `--target-type` (optional, default: `instance`): The type of targets that can be registered with this Target Group. Allowed values: `instance` (targets are specified by instance ID), `ip` (targets are IP addresses), `lambda` (targets are Lambda functions), `alb` (targets are Application Load Balancers).
        * `--health-check-protocol` (optional, default: `HTTP`): The protocol to use for health checks. Allowed values: `HTTP`, `HTTPS`, `TCP`.
        * `--health-check-path` (optional, default: `/`): The destination for health checks on the targets (e.g., `/health`). Required for `HTTP` and `HTTPS` health checks.
        * `--health-check-port` (optional, default: `traffic-port`): The port to use for health checks. You can specify a port number or `traffic-port` to use the port on which the targets receive traffic.
        * `--health-check-interval` (optional, default: `30`): The approximate interval, in seconds, between health checks of an individual target (between 5 and 300 seconds).
        * `--health-check-timeout` (optional, default: `5`): The amount of time, in seconds, during which no response means a failed health check (between 2 and 60 seconds).
        * `--healthy-threshold-count` (optional, default: `5`): The number of consecutive health checks successes required before considering an unhealthy target healthy (between 2 and 10).
        * `--unhealthy-threshold-count` (optional, default: `2`): The number of consecutive health check failures required before considering a target unhealthy (between 2 and 10).
        * `--matcher-http-code` (optional, default: `200`): The HTTP codes to use when checking for a successful response from a target (e.g., `200`, `200-299`). Only applicable for `HTTP` and `HTTPS` health checks.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new Target Group (e.g., `--tags "Environment=Production" "Team=Web"`).

4.  **`register-targets`**: Registers one or more targets with a specified Target Group.

    * **Description**: This subcommand adds backend instances or IP addresses to an existing Target Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Target Group resides.
        * `--target-group-identifier` (required): Specifies the Target Group ARN or name.
        * `--targets` (required): A list of targets to register. The format depends on the Target Group's `target-type`.
            * For `instance`: A comma-separated list of EC2 instance IDs (e.g., `--targets "i-0abcdef1234567890,i-0fedcba9876543210"`).
            * For `ip`: A comma-separated list of IP addresses and optionally their ports (e.g., `--targets "192.168.1.10:80,10.0.0.5:443"`). If no port is specified, the Target Group's default port is used.
            * For `lambda`: A comma-separated list of Lambda function ARNs.
            * For `alb`: A comma-separated list of Application Load Balancer ARNs.
        * `--port` (optional): The port to use when registering instance or IP address targets. This is only needed if you want to override the Target Group's default port for specific targets. If provided with `--targets` containing port information for IP addresses, this parameter will be ignored for those specific targets.

5.  **`deregister-targets`**: Deregisters one or more targets from a specified Target Group.

    * **Description**: This subcommand removes backend instances or IP addresses from an existing Target Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Target Group resides.
        * `--target-group-identifier` (required): Specifies the Target Group ARN or name.
        * `--targets` (required): A list of targets to deregister, following the same format as the `--targets` parameter in `register-targets`. You must specify the identifier (instance ID, IP address, Lambda ARN, or ALB ARN) of the target to deregister. For IP addresses, you might need to include the port if it was explicitly specified during registration.

6.  **`update-health-check`**: Modifies the health check configuration of an existing Target Group.

    * **Description**: This subcommand allows users to change the settings used to monitor the health of the targets within a Target Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Target Group resides.
        * `--target-group-identifier` (required): Specifies the Target Group ARN or name.
        * `--health-check-protocol` (optional): The new protocol to use for health checks (`HTTP`, `HTTPS`, `TCP`).
        * `--health-check-path` (optional): The new destination for health checks (e.g., `/api/health`).
        * `--health-check-port` (optional): The new port to use for health checks.
        * `--health-check-interval` (optional): The new health check interval in seconds.
        * `--health-check-timeout` (optional): The new health check timeout in seconds.
        * `--healthy-threshold-count` (optional): The new number of healthy checks required.
        * `--unhealthy-threshold-count` (optional): The new number of unhealthy checks required.
        * `--matcher-http-code` (optional): The new HTTP codes for successful responses.

7.  **`delete-target-group`**: Deletes a specified Target Group.

    * **Description**: This subcommand permanently removes a Target Group.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Target Group resides.
        * `--target-group-identifier` (required): Specifies the Target Group ARN or name to delete.
        * `--force` (optional): If provided, bypasses the confirmation prompt and immediately deletes the Target Group. Use with caution!

## Tool 2: Load Balancer Management Tool (`aws-lb-manager`)

### Description

The `aws-lb-manager` tool provides a comprehensive set of functionalities for managing Elastic Load Balancers (ELBs) within a specified AWS region. It enables users to list, describe, create, and delete various types of load balancers (Application, Network, Gateway), as well as manage their associated listeners. This tool aims to simplify the administration of load balancing resources in AWS.

### Subcommands and Parameters

1.  **`list-load-balancers`**: Retrieves and displays a detailed list of Load Balancers.

    * **Description**: This subcommand fetches all Load Balancers within the specified AWS region and presents their key attributes.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--type-filter` (optional): Allows filtering the list by Load Balancer type (`application`, `network`, `gateway`).
        * `--name-filter` (optional): Filters the list based on a substring match in the Load Balancer name.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

2.  **`describe-load-balancer`**: Displays detailed information about a specific Load Balancer.

    * **Description**: This subcommand retrieves and shows all configuration details of a given Load Balancer.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Load Balancer resides.
        * `--load-balancer-identifier` (required): Specifies the Load Balancer to describe. This can be either the **Load Balancer ARN** (e.g., `arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/my-load-balancer/abcdef1234567890`) or the **Load Balancer Name** (e.g., `my-load-balancer`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

3.  **`create-load-balancer`**: Creates a new Load Balancer with specified configurations.

    * **Description**: This subcommand allows users to define and create a new Load Balancer.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Load Balancer will be created.
        * `--name` (required): The name of the new Load Balancer (e.g., `my-new-lb`). This name must be unique within your AWS account and region for Application and Network Load Balancers, and globally unique for Gateway Load Balancers.
        * `--type` (required): The type of Load Balancer to create. Allowed values: `application`, `network`, `gateway`.
        * `--scheme` (optional, default: `internet-facing`): For Application and Network Load Balancers, specifies whether the Load Balancer is accessible from the internet (`internet-facing`) or only within the VPC (`internal`). Not applicable for Gateway Load Balancers.
        * `--security-groups` (optional): A comma-separated list of security group IDs to associate with the Load Balancer (only for Application and Network Load Balancers).
        * `--subnet-mappings` (required for Application and Network Load Balancers in a VPC, not applicable for Gateway Load Balancers): A comma-separated list of subnet IDs and optionally their availability zones in the format `subnet-xxxxxxxxxxxxx=az-yyyyyyy,subnet-zzzzzzzzzzzzzzzzz=az-wwwwwww`. At least two subnets in different Availability Zones are typically required for high availability.
        * `--ip-address-type` (optional, default: `ipv4`): For Network Load Balancers, specifies the IP address type (`ipv4` or `dualstack`).
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new Load Balancer.

4.  **`create-listener`**: Creates a new listener for a specified Load Balancer.

    * **Description**: This subcommand adds a listener to an existing Load Balancer, defining how it accepts incoming traffic and forwards it to Target Groups.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Load Balancer resides.
        * `--load-balancer-identifier` (required): Specifies the Load Balancer ARN or name to add the listener to.
        * `--protocol` (required): The protocol for connections from clients to the Load Balancer. Allowed values vary by Load Balancer type (e.g., `HTTP`, `HTTPS`, `TCP`, `TLS`, `UDP`, `TCP_UDP`).
        * `--port` (required): The port on which the Load Balancer listens for incoming traffic (e.g., `80`, `443`).
        * `--default-actions` (required): A JSON string defining the action to take when a client connects to the listener. Typically, this involves forwarding traffic to one or more Target Groups. For example: `'[{"Type": "forward", "TargetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-targets/abcdef1234567890"}]'`. More complex configurations with multiple actions (redirects, fixed responses) might be supported depending on the Load Balancer type.
        * `--ssl-policy` (optional, only for HTTPS/TLS listeners): The security policy to apply to the listener.
        * `--certificate-arns` (optional, only for HTTPS/TLS listeners): A comma-separated list of SSL certificate ARNs to associate with the listener.

5.  **`delete-listener`**: Deletes a specified listener from a Load Balancer.

    * **Description**: This subcommand removes a listener from a Load Balancer.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Load Balancer resides.
        * `--listener-arn` (required): The ARN of the listener to delete (e.g., `arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-load-balancer/abcdef1234567890/ghijklmnop`).

6.  **`delete-load-balancer`**: Deletes a specified Load Balancer.

    * **Description**: This subcommand permanently removes a Load Balancer.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the Load Balancer resides.
        * `--load-balancer-identifier` (required): Specifies the Load Balancer ARN or name to delete.
        * `--force` (optional): If provided, bypasses the confirmation prompt and immediately deletes the Load Balancer. Use with extreme caution as this can disrupt traffic.

This detailed prompt provides a more comprehensive understanding of the functionalities and parameters required for each tool. Remember to handle potential errors, validate user inputs, and provide informative feedback to the user during the execution of these tools. Good luck with your development!