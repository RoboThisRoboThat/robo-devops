# Prompt for Building Detailed AWS Simple Queue Service (SQS) Management Tools

## Tool: SQS Management Tool (`aws-sqs-manager`)

### Description

The `aws-sqs-manager` tool is designed to provide comprehensive management capabilities for AWS Simple Queue Service (SQS) queues and messages. It allows users to perform a wide range of actions, from listing and describing queues to creating, deleting, sending, receiving, and managing messages within those queues. This tool aims to simplify the interaction with SQS, making it easier to manage your message queuing infrastructure in the cloud.

### Subcommands and Parameters

1.  **`list-queues`**: Retrieves a detailed list of SQS queues.

    * **Description**: This subcommand fetches all SQS queues associated with your AWS account in a specified region.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`).
        * `--queue-name-prefix` (optional): Filters the results to include only queues whose names begin with the specified prefix.
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

2.  **`get-queue-url`**: Retrieves the URL of a specific SQS queue.

    * **Description**: This subcommand returns the URL of an existing SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-name` (required): The name of the SQS queue (e.g., `my-message-queue`).
        * `--queue-owner-aws-account-id` (optional): The AWS account ID of the account that created the queue. Required if the queue is owned by someone other than the account making the request.
        * `--output-format` (optional): Specifies the output format (`text`).

3.  **`get-queue-attributes`**: Displays detailed attributes of a specific SQS queue.

    * **Description**: This subcommand retrieves and shows all configuration attributes of a given SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue.
        * `--attribute-names` (optional): A list of specific attribute names to retrieve (e.g., `VisibilityTimeout`, `MaximumMessageSize`). If not specified, all attributes are returned. Consult the AWS SQS API documentation for available attribute names.
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

4.  **`create-queue`**: Creates a new SQS queue.

    * **Description**: This subcommand allows users to define and create a new SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the queue.
        * `--queue-name` (required): The name of the new SQS queue (e.g., `new-task-queue`).
        * `--attributes` (optional): A JSON string or a path to a JSON file specifying the queue attributes to set during creation (e.g., `'{"VisibilityTimeout": "30", "MaximumMessageSize": "262144"}'`). Consult the AWS SQS API documentation for available attributes.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new queue (e.g., `--tags "Environment=Processing" "Priority=High"`).

5.  **`delete-queue`**: Deletes a specified SQS queue.

    * **Description**: This subcommand permanently removes an SQS queue and all its messages. Use with caution.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to delete.

6.  **`send-message`**: Sends a message to a specified SQS queue.

    * **Description**: This subcommand allows users to send a message to an SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to send the message to.
        * `--message-body` (required): The content of the message to send (a string).
        * `--delay-seconds` (optional, default: `0`): The number of seconds (0 to 900) to delay the delivery of the message.
        * `--message-attributes` (optional): A JSON string or a path to a JSON file specifying message attributes. Message attributes can provide structured metadata about the message. Consult the AWS SQS API documentation for the attribute structure. Example: `'{"Priority": {"DataType": "String", "StringValue": "High"}}'`.
        * `--message-system-attributes` (optional): A JSON string or a path to a JSON file specifying message system attributes. These are special attributes handled by SQS (e.g., `AWSTraceHeader`). Consult the AWS SQS API documentation for available system attributes.
        * `--message-deduplication-id` (optional): The token used for deduplication of sent messages. Required when using FIFO queues.
        * `--message-group-id` (optional): The tag that specifies that a message belongs to a specific message group. Required when using FIFO queues.

7.  **`receive-message`**: Retrieves one or more messages from a specified SQS queue.

    * **Description**: This subcommand allows users to receive messages from an SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to receive messages from.
        * `--attribute-names` (optional): A list of message attribute names to include in the received messages (e.g., `SenderId`, `SentTimestamp`, `ApproximateReceiveCount`). Use `All` to receive all standard attributes.
        * `--message-attribute-names` (optional): A list of message attribute names to include in the received messages (e.g., `Priority`, `Source`). Use `All` to receive all message attributes.
        * `--max-number-of-messages` (optional, default: `1`, max: `10`): The maximum number of messages to receive.
        * `--visibility-timeout` (optional): The duration (in seconds) that the received messages are hidden from subsequent retrieve requests.
        * `--wait-time-seconds` (optional, default: `0`, max: `20`): The duration (in seconds) for which the call waits for a message to arrive in the queue before returning. A non-zero value enables long polling.
        * `--receive-request-attempt-id` (optional): A parameter that identifies the current receive request.

8.  **`delete-message`**: Deletes a specified message from an SQS queue.

    * **Description**: This subcommand allows users to delete a message from an SQS queue using its receipt handle.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to delete the message from.
        * `--receipt-handle` (required): The receipt handle of the message to delete (obtained from a `receive-message` call).

9.  **`delete-message-batch`**: Deletes multiple messages from a specified SQS queue in a single action.

    * **Description**: This subcommand allows users to delete up to 10 messages from an SQS queue in one request.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to delete messages from.
        * `--entries` (required): A JSON string or a path to a JSON file defining the messages to delete. Each entry should have an `Id` (a user-defined identifier) and a `ReceiptHandle`. Example: `'[{"Id": "msg1", "ReceiptHandle": "AQE..."}]'`.

10. **`purge-queue`**: Deletes all messages from a specified SQS queue.

    * **Description**: This subcommand removes all messages from a queue. Use with extreme caution as this action is irreversible.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to purge.

11. **`set-queue-attributes`**: Sets or modifies the attributes of an SQS queue.

    * **Description**: This subcommand allows users to update the configuration attributes of an existing SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to modify.
        * `--attributes` (required): A JSON string or a path to a JSON file specifying the attributes to set (e.g., `'{"VisibilityTimeout": "60"}'`). The JSON should be a map of attribute name to attribute value (as a string). Consult the AWS SQS API documentation for available attributes.

12. **`get-queue-policy`**: Retrieves the policy of a specified SQS queue.

    * **Description**: This subcommand returns the JSON policy for a given SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to get the policy for.
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

13. **`set-queue-policy`**: Sets or modifies the policy of an SQS queue.

    * **Description**: This subcommand allows users to set or update the access policy for an SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to set the policy for.
        * `--policy` (required): A JSON string or a path to a JSON file containing the policy document.

14. **`add-permission`**: Adds permissions to a specified SQS queue.

    * **Description**: This subcommand adds permissions to an SQS queue for specific principals to perform actions.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to add permissions to.
        * `--label` (required): The identifier for the permission being added.
        * `--aws-account-ids` (required): A comma-separated list of AWS account IDs of the principals who will receive the permissions.
        * `--actions` (required): A comma-separated list of SQS actions being granted (e.g., `SendMessage`, `ReceiveMessage`, `DeleteMessage`). Consult the AWS SQS API documentation for available actions.

15. **`remove-permission`**: Removes permissions from a specified SQS queue.

    * **Description**: This subcommand removes the permission with the specified label from an SQS queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the SQS queue to remove permissions from.
        * `--label` (required): The identifier of the permission to remove.

16. **`list-dead-letter-source-queues`**: Returns a list of the source queues for a specified dead-letter queue.

    * **Description**: This subcommand lists the queues that are configured as dead-letter queues for a given queue.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the queue resides.
        * `--queue-url` (required): The URL of the dead-letter queue.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).