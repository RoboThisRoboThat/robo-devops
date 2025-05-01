# Prompt for Building Detailed AWS Route 53 and Certificate Manager (ACM) Management Tools

## Tool: DNS and Certificate Management Tool (`aws-dns-cert-manager`)

### Description

The `aws-dns-cert-manager` tool is designed to provide comprehensive management capabilities for AWS Route 53 hosted zones, record sets, and AWS Certificate Manager (ACM) certificates. It allows users to perform a wide range of actions, from listing and describing DNS zones and certificates to creating, deleting, modifying DNS records, and requesting, importing, and managing SSL/TLS certificates. This tool aims to simplify the interaction with both Route 53 and ACM, making it easier to manage your domain name system and SSL/TLS certificates in the cloud.

## Subcommands and Parameters - Route 53 Management

1.  **`list-hosted-zones`**: Retrieves a detailed list of Route 53 hosted zones.

    * **Description**: This subcommand fetches all Route 53 hosted zones associated with your AWS account.
    * **Parameters**:
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

2.  **`get-hosted-zone`**: Displays detailed information about a specific Route 53 hosted zone.

    * **Description**: This subcommand retrieves and shows all configuration details of a given Route 53 hosted zone.
    * **Parameters**:
        * `--hosted-zone-id` (required): Specifies the ID of the hosted zone (e.g., `/hostedzone/Z1234567890ABCDEF`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

3.  **`create-hosted-zone`**: Creates a new Route 53 hosted zone.

    * **Description**: This subcommand allows users to create a new Route 53 hosted zone for a given domain name.
    * **Parameters**:
        * `--name` (required): The domain name for which you want to create the hosted zone (e.g., `example.com`).
        * `--caller-reference` (required): A unique string that identifies the request.
        * `--hosted-zone-config` (optional): A JSON string or path to a JSON file specifying configuration options for the hosted zone (e.g., comment).
        * `--delegation-set-id` (optional): If you want to associate the hosted zone with a reusable delegation set.

4.  **`delete-hosted-zone`**: Deletes a specified Route 53 hosted zone.

    * **Description**: This subcommand permanently removes a Route 53 hosted zone. **Note:** The hosted zone must be empty of all record sets except the default NS and SOA records.
    * **Parameters**:
        * `--hosted-zone-id` (required): Specifies the ID of the hosted zone to delete.

5.  **`list-resource-record-sets`**: Retrieves a detailed list of resource record sets in a hosted zone.

    * **Description**: This subcommand fetches all resource record sets within a specified Route 53 hosted zone.
    * **Parameters**:
        * `--hosted-zone-id` (required): Specifies the ID of the hosted zone.
        * `--start-record-name` (optional): The first name in the lexicographic ordering of resource record sets that you want to list.
        * `--start-record-type` (optional): The type of records you want to start listing from.
        * `--start-record-identifier` (optional): If you have multiple records with the same name and type, this specifies the record identifier to start from.
        * `--max-items` (optional): The maximum number of records to return.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

6.  **`change-resource-record-sets`**: Creates, updates, or deletes resource record sets in a hosted zone.

    * **Description**: This subcommand allows users to modify the DNS records within a specified Route 53 hosted zone.
    * **Parameters**:
        * `--hosted-zone-id` (required): Specifies the ID of the hosted zone to modify.
        * `--change-batch` (required): A JSON string or a path to a JSON file that defines the changes to be made to the resource record sets. This includes an array of `Changes`, where each change specifies an `Action` (`CREATE`, `DELETE`, `UPSERT`) and a `ResourceRecordSet` object. Consult the AWS Route 53 API documentation for the structure of the `ChangeBatch` and `ResourceRecordSet`. Example:
            ```json
            {
                "Changes": [
                    {
                        "Action": "UPSERT",
                        "ResourceRecordSet": {
                            "Name": "[www.example.com](https://www.example.com)",
                            "Type": "A",
                            "TTL": 300,
                            "ResourceRecords": [
                                {
                                    "Value": "192.0.2.1"
                                }
                            ]
                        }
                    }
                ]
            }
            ```

7.  **`get-change`**: Retrieves the status of a change batch request.

    * **Description**: This subcommand fetches the status of a previous `change-resource-record-sets` request.
    * **Parameters**:
        * `--id` (required): The ID of the change batch request returned by `change-resource-record-sets`.
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

8.  **`list-reusable-delegation-sets`**: Retrieves a list of reusable delegation sets.

    * **Description**: This subcommand fetches all reusable delegation sets associated with your AWS account.
    * **Parameters**:
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

9.  **`get-reusable-delegation-set`**: Retrieves information about a specified reusable delegation set.

    * **Description**: This subcommand fetches details for a given reusable delegation set.
    * **Parameters**:
        * `--id` (required): The ID of the reusable delegation set.
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

## Subcommands and Parameters - AWS Certificate Manager (ACM) Management

1.  **`list-certificates`**: Retrieves a list of ACM certificates.

    * **Description**: This subcommand fetches a summary list of SSL/TLS certificates managed by ACM in a specified region.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region to query (e.g., `us-east-1`).
        * `--certificate-statuses` (optional): A list of certificate statuses to filter by (e.g., `ISSUED`, `PENDING_VALIDATION`).
        * `--includes` (optional): Specifies whether to include certificate details such as key algorithm or extended key usage.
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

2.  **`describe-certificate`**: Displays detailed information about a specific ACM certificate.

    * **Description**: This subcommand retrieves and shows all configuration details of a given ACM certificate.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the certificate resides.
        * `--certificate-arn` (required): Specifies the ARN of the ACM certificate (e.g., `arn:aws:acm:us-east-1:123456789012:certificate/abcdef12-3456-7890-abcd-ef1234567890`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

3.  **`request-certificate`**: Requests a new SSL/TLS certificate from ACM.

    * **Description**: This subcommand requests a new public or private SSL/TLS certificate from AWS Certificate Manager.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to request the certificate.
        * `--domain-name` (required): The fully qualified domain name (FQDN) for the certificate (e.g., `example.com`).
        * `--validation-method` (optional, default: `DNS`): The method ACM uses to validate that you own or control the domain. Allowed values: `DNS`, `EMAIL`.
        * `--subject-alternative-names` (optional): A list of additional FQDNs to be included in the certificate.
        * `--idempotency-token` (optional): A unique identifier that you provide to ensure idempotency of the request.
        * `--domain-validation-options` (optional): A list of domain validation options. Required for certain scenarios with DNS validation.
        * `--certificate-authority-arn` (optional): The ARN of the private certificate authority (CA) to use. Required for private certificates.
        * `--options` (optional): Options to specify when requesting a certificate.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new certificate.

4.  **`delete-certificate`**: Deletes a specified ACM certificate.

    * **Description**: This subcommand permanently removes an ACM certificate. **Note:** The certificate cannot be in use by any AWS resources when you attempt to delete it.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the certificate resides.
        * `--certificate-arn` (required): The ARN of the ACM certificate to delete.

5.  **`import-certificate`**: Imports an existing SSL/TLS certificate into ACM.

    * **Description**: This subcommand imports a certificate you obtained from a third-party CA into AWS Certificate Manager.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region in which to import the certificate.
        * `--certificate` (required): The certificate body as a PEM-encoded string or a path to a file containing it.
        * `--private-key` (required): The private key for the certificate as a PEM-encoded string or a path to a file containing it.
        * `--certificate-chain` (optional): The certificate chain as a PEM-encoded string or a path to a file containing it.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the imported certificate.

6.  **`add-tags-to-certificate`**: Adds one or more tags to an ACM certificate.

    * **Description**: This subcommand allows users to add tags to an existing ACM certificate.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the certificate resides.
        * `--certificate-arn` (required): The ARN of the ACM certificate to add tags to.
        * `--tags` (required): A list of key-value pairs to add (e.g., `--tags "Environment=Production" "Purpose=SSL"`).

7.  **`remove-tags-from-certificate`**: Removes one or more tags from an ACM certificate.

    * **Description**: This subcommand allows users to remove tags from an existing ACM certificate.
    * **Parameters**:
        * `--region` (required): Specifies the AWS region where the certificate resides.
        * `--certificate-arn` (required): The ARN of the ACM certificate to remove tags from.
        * `--tag-keys` (required): A list of tag keys to remove (e.g., `--tag-keys "Environment" "Purpose"`).