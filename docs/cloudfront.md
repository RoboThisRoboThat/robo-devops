# Prompt for Building Detailed AWS CloudFront Management Tools

## Tool: CloudFront Management Tool (`aws-cloudfront-manager`)

### Description

The `aws-cloudfront-manager` tool is designed to provide comprehensive management capabilities for AWS CloudFront distributions. It allows users to perform a wide range of actions, from listing and describing distributions to creating, updating, and invalidating cache. This tool aims to simplify the interaction with CloudFront, making it easier to manage your content delivery network.

### Subcommands and Parameters

1.  **`list-distributions`**: Retrieves and displays a detailed list of CloudFront distributions.

    * **Description**: This subcommand fetches all CloudFront distributions associated with your AWS account and presents their key attributes in an organized manner.
    * **Parameters**:
        * `--output-format` (optional): Specifies the desired output format. Supported values could include `text` (default, human-readable text output), `json` (JSON formatted output), or `table` (formatted table output).

2.  **`describe-distribution`**: Displays detailed information about a specific CloudFront distribution.

    * **Description**: This subcommand retrieves and shows all configuration details of a given CloudFront distribution.
    * **Parameters**:
        * `--distribution-id` (required): Specifies the ID of the CloudFront distribution to describe (e.g., `E1234567890ABCDEF`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

3.  **`create-distribution`**: Creates a new CloudFront distribution with specified configurations.

    * **Description**: This subcommand allows users to define and create a new CloudFront distribution.
    * **Parameters**:
        * `--origin-domain` (required): The domain name of the origin server from which CloudFront gets content (e.g., `my-bucket.s3.amazonaws.com` or `my-web-server.example.com`).
        * `--origin-path` (optional): An optional path that CloudFront appends to the origin domain name when requesting content from the origin (e.g., `/images`).
        * `--viewer-protocol-policy` (optional, default: `Allow-all`): The protocol policy that viewers can use to access content in a CloudFront distribution. Allowed values: `allow-all`, `https-only`, `redirect-to-https`.
        * `--allowed-http-methods` (optional, default: `GET, HEAD`): The HTTP methods that CloudFront processes and forwards to your origin. Specify as a comma-separated list (e.g., `GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH`).
        * `--cached-methods` (optional, default: `GET, HEAD`): The HTTP methods for which CloudFront caches responses from your origin. Specify as a comma-separated list. Typically `GET` and `HEAD`.
        * `--forward-query-string` (optional, default: `false`): Specifies whether CloudFront forwards query strings to the origin. Boolean value (`true` or `false`).
        * `--forwarded-headers` (optional): A comma-separated list of headers that CloudFront forwards to the origin. Use `all` to forward all standard and custom headers.
        * `--compress` (optional, default: `false`): Specifies whether CloudFront automatically compresses certain files for faster delivery to viewers. Boolean value.
        * `--price-class` (optional, default: `PriceClass_100`): The price class that corresponds with the CloudFront regions that will serve your distribution. Allowed values: `PriceClass_100`, `PriceClass_200`, `PriceClass_All`. Lower price classes typically mean fewer edge locations.
        * `--viewer-certificate-minimum-protocol-version` (optional): The minimum SSL/TLS protocol that viewers can use to access content.
        * `--viewer-certificate-cloudfront-default-certificate` (optional, default: `true`): Indicates whether you want to use the default CloudFront certificate for HTTPS connections. Boolean value. If `false`, you'll likely need to specify `--viewer-certificate-acm-certificate-arn` or other certificate options.
        * `--viewer-certificate-acm-certificate-arn` (optional): The ARN of the ACM certificate to use for HTTPS connections.
        * `--viewer-certificate-ssl-support-method` (optional): Specifies how CloudFront serves HTTPS requests.
        * `--logging-enabled` (optional, default: `false`): Specifies whether to enable logging for the distribution. Boolean value. If `true`, you'll likely need to specify `--logging-bucket` and optionally `--logging-prefix`.
        * `--logging-bucket` (optional): The Amazon S3 bucket to store the access logs (e.g., `my-logs-bucket.s3.amazonaws.com`). Required if `--logging-enabled` is `true`.
        * `--logging-prefix` (optional): An optional prefix for the log file names.
        * `--enabled` (optional, default: `true`): Specifies whether the distribution is enabled. Boolean value.
        * `--aliases` (optional): A comma-separated list of CNAME aliases for the distribution (e.g., `www.example.com,cdn.example.com`).
        * `--default-root-object` (optional): The object that you want CloudFront to request from your origin (e.g., `index.html`).
        * `--error-pages` (optional): A JSON string defining custom error responses. For example: `'[{"ErrorCode": 404, "ResponsePagePath": "/error.html", "ResponseCode": "200", "TTL": 300}]'`.
        * `--restrictions-geo-restriction-type` (optional): The method that you want to use to restrict distribution of your content by country. Allowed values: `blacklist`, `whitelist`, `none`.
        * `--restrictions-geo-restriction-locations` (optional): A comma-separated list of country codes for the specified `--restrictions-geo-restriction-type`.
        * `--web-acl-id` (optional): The ID of the AWS WAF web ACL to associate with this distribution.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new distribution (e.g., `--tags "Environment=Production" "Service=CDN"`).

4.  **`update-distribution`**: Updates the configuration of an existing CloudFront distribution.

    * **Description**: This subcommand allows users to modify various settings of an existing CloudFront distribution.
    * **Parameters**:
        * `--distribution-id` (required): Specifies the ID of the CloudFront distribution to update.
        * `--origin-domain` (optional): The new origin domain name.
        * `--origin-path` (optional): The new origin path.
        * `--viewer-protocol-policy` (optional): The new viewer protocol policy.
        * `--allowed-http-methods` (optional): The new allowed HTTP methods.
        * `--cached-methods` (optional): The new cached HTTP methods.
        * `--forward-query-string` (optional): The new setting for forwarding query strings (`true` or `false`).
        * `--forwarded-headers` (optional): The new list of forwarded headers.
        * `--compress` (optional): The new compression setting (`true` or `false`).
        * `--price-class` (optional): The new price class.
        * `--viewer-certificate-minimum-protocol-version` (optional): The new minimum SSL/TLS protocol.
        * `--viewer-certificate-cloudfront-default-certificate` (optional): The new setting for using the default certificate (`true` or `false`).
        * `--viewer-certificate-acm-certificate-arn` (optional): The new ACM certificate ARN.
        * `--viewer-certificate-ssl-support-method` (optional): The new SSL support method.
        * `--logging-enabled` (optional): The new logging enabled setting (`true` or `false`).
        * `--logging-bucket` (optional): The new logging bucket.
        * `--logging-prefix` (optional): The new logging prefix.
        * `--enabled` (optional): The new enabled setting (`true` or `false`).
        * `--aliases` (optional): The new list of CNAME aliases.
        * `--default-root-object` (optional): The new default root object.
        * `--error-pages` (optional): The new JSON string for custom error responses.
        * `--restrictions-geo-restriction-type` (optional): The new geo restriction type.
        * `--restrictions-geo-restriction-locations` (optional): The new list of geo restriction locations.
        * `--web-acl-id` (optional): The new web ACL ID.
        * `--if-match` (required): The current ETag value for the distribution. This is crucial for performing conditional updates and preventing unintended overwrites. You would typically fetch this value when describing the distribution and then provide it during the update.

5.  **`delete-distribution`**: Deletes a specified CloudFront distribution.

    * **Description**: This subcommand permanently removes a CloudFront distribution. **Note:** A distribution must be disabled before it can be deleted.
    * **Parameters**:
        * `--distribution-id` (required): Specifies the ID of the CloudFront distribution to delete.
        * `--if-match` (required): The current ETag value for the distribution.
        * `--force` (optional): If provided, attempts to disable the distribution before deleting it if it's currently enabled. Use with caution.

6.  **`create-invalidation`**: Creates a new invalidation request for a specified CloudFront distribution.

    * **Description**: This subcommand allows users to remove objects from CloudFront edge caches. After you invalidate an object, the next time a viewer requests that object, CloudFront returns to the origin to fetch the latest version.
    * **Parameters**:
        * `--distribution-id` (required): Specifies the ID of the CloudFront distribution for which you want to create an invalidation.
        * `--paths` (required): A comma-separated list of the object paths that you want to invalidate. You can use wildcards (*) to invalidate multiple objects (e.g., `/images/image1.jpg, /css/*`). To invalidate all objects, use `/*`.
        * `--caller-reference` (optional): A unique value that prevents the accidental creation of duplicate invalidation requests. If you don't provide one, the tool should generate a unique value (e.g., a timestamp).

7.  **`get-invalidation`**: Retrieves the status of a specific invalidation request.

    * **Description**: This subcommand allows users to check the progress of an invalidation request.
    * **Parameters**:
        * `--distribution-id` (required): Specifies the ID of the CloudFront distribution.
        * `--invalidation-id` (required): Specifies the ID of the invalidation request to get the status for.

### Technical Considerations

* **AWS SDK (Boto3):** The tool should be built using the Boto3 library for Python to interact with AWS services.
* **Authentication:** The tool should utilize appropriate AWS credentials configured in the environment (e.g., IAM roles, access keys).
* **Error Handling:** Implement robust error handling to catch exceptions and provide informative error messages to the user. Pay special attention to errors related to distribution state (e.g., attempting to delete an enabled distribution).
* **Output Formatting:** Present the retrieved information in a clear and readable format (`text`, `json`, `table`).
* **Command-Line Interface (CLI):** Consider using a library like `argparse` in Python to create a user-friendly command-line interface.
* **ETag Handling:** For update and delete operations, the CloudFront API requires the `If-Match` header with the current ETag of the distribution. The tool will need to retrieve this ETag when describing the distribution and then use it in the update/delete requests.

This detailed prompt should provide a solid foundation for building your AWS CloudFront management tool. Remember to consult the Boto3 documentation for CloudFront to understand the specific requirements and available options for each API call. Good luck!