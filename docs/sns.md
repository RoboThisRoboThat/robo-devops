# Prompt for Building Detailed AWS SNS Management Tools

## Tool: SNS Management Tool (`aws-sns-manager`)

### Description

The `aws-sns-manager` tool is designed to provide comprehensive management capabilities for AWS Simple Notification Service (SNS) topics, subscriptions, and messages. It allows users to perform a wide range of actions, from listing and describing topics and subscriptions to creating, deleting, subscribing, unsubscribing, and publishing messages. This tool aims to simplify the interaction with SNS, making it easier to manage your messaging infrastructure in the cloud.

### Subcommands and Parameters

1.  **`list-topics`**: Retrieves a detailed list of SNS topics.

    * **Description**: This subcommand fetches all SNS topics associated with your AWS account in a specified region.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query (e.g., `us-east-1`, `ap-southeast-2`).
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

2.  **`get-topic-attributes`**: Displays detailed attributes of a specific SNS topic.

    * **Description**: This subcommand retrieves and shows all configuration attributes of a given SNS topic.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the topic resides.
        * `--topic-arn` (required): Specifies the ARN (Amazon Resource Name) of the SNS topic (e.g., `arn:aws:sns:us-east-1:123456789012:my-topic`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

3.  **`create-topic`**: Creates a new SNS topic.

    * **Description**: This subcommand allows users to define and create a new SNS topic.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the topic.
        * `--name` (required): The name of the new SNS topic (e.g., `new-notification-topic`).
        * `--attributes` (optional): A JSON string or a path to a JSON file specifying the topic attributes to set during creation (e.g., `'{"DisplayName": "My Notification Topic"}'`). Consult the AWS SNS API documentation for available attributes.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new topic (e.g., `--tags "Environment=Production" "Service=Notifications"`).

4.  **`delete-topic`**: Deletes a specified SNS topic.

    * **Description**: This subcommand permanently removes an SNS topic and all its subscriptions. Use with caution.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the topic resides.
        * `--topic-arn` (required): The ARN of the SNS topic to delete.

5.  **`list-subscriptions`**: Retrieves a detailed list of SNS subscriptions.

    * **Description**: This subcommand fetches all SNS subscriptions associated with your AWS account in a specified region.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

6.  **`list-subscriptions-by-topic`**: Retrieves a detailed list of subscriptions to a specific SNS topic.

    * **Description**: This subcommand fetches all SNS subscriptions associated with a given SNS topic ARN.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the topic resides.
        * `--topic-arn` (required): The ARN of the SNS topic to list subscriptions for.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

7.  **`get-subscription-attributes`**: Displays detailed attributes of a specific SNS subscription.

    * **Description**: This subcommand retrieves and shows all configuration attributes of a given SNS subscription.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the subscription resides.
        * `--subscription-arn` (required): Specifies the ARN of the SNS subscription (e.g., `arn:aws:sns:us-east-1:123456789012:my-topic:abcdef12-3456-7890-abcd-ef1234567890`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

8.  **`subscribe`**: Creates a new SNS subscription.

    * **Description**: This subcommand allows users to subscribe an endpoint to an SNS topic.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the topic resides.
        * `--topic-arn` (required): The ARN of the SNS topic to subscribe to.
        * `--protocol` (required): The protocol to use for the subscription endpoint (e.g., `email`, `sms`, `sqs`, `lambda`, `http`, `https`, `application`).
        * `--endpoint` (required): The endpoint that you want to receive notifications. This varies by protocol (e.g., an email address for `email`, a phone number for `sms`, an SQS queue ARN for `sqs`, a Lambda function ARN for `lambda`, a URL for `http`/`https`, an application endpoint ARN for `application`).
        * `--attributes` (optional): A JSON string or a path to a JSON file specifying the subscription attributes to set during creation (e.g., `'{"FilterPolicy": "{\"attribute\": [\"value\"]}"}'`). Consult the AWS SNS API documentation for available attributes.
        * `--return-subscription-arn` (optional, default: `false`): If `true`, the ARN of the newly created subscription is returned.

9.  **`unsubscribe`**: Deletes a specified SNS subscription.

    * **Description**: This subcommand permanently removes an SNS subscription.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the subscription resides.
        * `--subscription-arn` (required): The ARN of the SNS subscription to delete.

10. **`publish`**: Publishes a message to a specified SNS topic.

    * **Description**: This subcommand allows users to send a message to all subscribers of an SNS topic.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the topic resides.
        * `--topic-arn` (required): The ARN of the SNS topic to publish to.
        * `--message` (required): The message to send. This should be a plain text string unless `--message-structure` is specified.
        * `--subject` (optional): The subject line to be used when the message is delivered to email endpoints.
        * `--message-structure` (optional, default: `simple`): Specifies the format of the message. Set to `json` if you are providing a JSON message with different content for different delivery protocols. Consult the AWS SNS API documentation for the JSON message structure.
        * `--message-attributes` (optional): A JSON string or a path to a JSON file specifying message attributes. Message attributes can provide additional information about the message and can be used by subscription filter policies. Consult the AWS SNS API documentation for the attribute structure. Example: `'{"attributeName": {"DataType": "String", "StringValue": "stringValue"}}'`.
        * `--target-arn` (optional): The ARN of an endpoint (e.g., a phone number, a mobile application endpoint) to send a direct message to, bypassing topic subscriptions.
        * `--phone-number` (optional): The phone number to send an SMS message to directly, bypassing topic subscriptions.

11. **`set-topic-attributes`**: Sets or modifies the attributes of an SNS topic.

    * **Description**: This subcommand allows users to update the configuration attributes of an existing SNS topic.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the topic resides.
        * `--topic-arn` (required): The ARN of the SNS topic to modify.
        * `--attribute-name` (required): The name of the attribute to set (e.g., `DisplayName`, `Policy`). Consult the AWS SNS API documentation for available attributes.
        * `--attribute-value` (required): The new value for the attribute. For policy attributes, this will be a JSON string.

12. **`set-subscription-attributes`**: Sets or modifies the attributes of an SNS subscription.

    * **Description**: This subcommand allows users to update the configuration attributes of an existing SNS subscription.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the subscription resides.
        * `--subscription-arn` (required): The ARN of the SNS subscription to modify.
        * `--attribute-name` (required): The name of the attribute to set (e.g., `FilterPolicy`, `DeliveryPolicy`). Consult the AWS SNS API documentation for available attributes.
        * `--attribute-value` (required): The new value for the attribute. For policy attributes, this will be a JSON string.

13. **`list-platform-applications`**: Lists the platform applications.

    * **Description**: This subcommand retrieves a list of platform applications in a specified region, which are used for push notifications to mobile devices.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

14. **`create-platform-application`**: Creates a platform application object for push notifications.

    * **Description**: This subcommand allows users to create a platform application object for a specific platform (e.g., APNS, GCM/FCM).
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to create the platform application.
        * `--name` (required): The name of the platform application.
        * `--platform` (required): The platform of the endpoint to create (`APNS`, `APNS_SANDBOX`, `GCM`, `ADM`, `BAIDU`).
        * `--attributes` (required): A JSON string or a path to a JSON file specifying the platform-specific attributes (e.g., `{"PlatformCredential": "...", "PlatformPrincipal": "..."}`). Consult the AWS SNS API documentation for required attributes for each platform.

15. **`delete-platform-application`**: Deletes a platform application.

    * **Description**: This subcommand permanently removes a platform application.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the platform application resides.
        * `--platform-application-arn` (required): The ARN of the platform application to delete.

16. **`list-endpoints-by-platform-application`**: Lists the endpoints for a platform application.

    * **Description**: This subcommand retrieves a list of endpoints (device tokens) registered with a specific platform application.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the platform application resides.
        * `--platform-application-arn` (required): The ARN of the platform application.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

17. **`create-platform-endpoint`**: Creates an endpoint for a device on a platform application.

    * **Description**: This subcommand allows users to register a device token with a platform application to receive push notifications.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the platform application resides.
        * `--platform-application-arn` (required): The ARN of the platform application.
        * `--token` (required): The device token.
        * `--attributes` (optional): A JSON string or a path to a JSON file specifying endpoint attributes.

18. **`delete-endpoint`**: Deletes an endpoint.

    * **Description**: This subcommand permanently removes a registered endpoint.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the endpoint resides.
        * `--endpoint-arn` (required): The ARN of the endpoint to delete.