# Prompt for Building Detailed AWS Billing and Cost Management Tools

## Tool: AWS Billing and Cost Management Tool (`aws-billing-manager`)

### Description

The `aws-billing-manager` tool aims to provide insights into your AWS costs and potentially manage certain cost-related settings. It will leverage AWS Cost Explorer, Budgets, and potentially the Billing and Cost Management API (if direct actions are supported) to retrieve and present billing information. Due to the nature of AWS billing, direct manipulation (like adjusting charges) is generally not possible through these APIs. The focus will be on retrieving data and setting up cost controls.

### Subcommands and Parameters

1.  **`get-cost-and-usage`**: Retrieves detailed cost and usage data using AWS Cost Explorer.

    * **Description**: This subcommand queries AWS Cost Explorer to retrieve granular cost and usage information based on specified filters and time ranges.
    * **Parameters**:
        * `--region` (optional, default: `us-east-1` - Cost Explorer is typically in this region): Specifies the AWS region for Cost Explorer. While Cost Explorer is global, some functionalities might be tied to `us-east-1`.
        * `--time-period` (required): The start and end date for retrieving data, in `YYYY-MM-DD` format (e.g., `--time-period 2024-01-01,2024-01-31`).
        * `--granularity` (optional, default: `MONTHLY`): The time granularity for the data. Allowed values: `DAILY`, `MONTHLY`.
        * `--group-by` (optional): A comma-separated list of dimensions to group the results by (e.g., `SERVICE`, `REGION`, `USAGE_TYPE`).
        * `--filter` (optional): A JSON string or a path to a JSON file specifying filters to apply (e.g., `'{"Dimensions": {"Key": "SERVICE", "Values": ["Amazon EC2"]}}'`). Consult the AWS Cost Explorer API documentation for filter syntax.
        * `--metrics` (optional, default: `UnblendedCost`): A comma-separated list of metrics to retrieve (e.g., `UnblendedCost`, `UsageQuantity`). Consult the AWS Cost Explorer API documentation for available metrics.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

2.  **`get-cost-forecast`**: Retrieves a cost forecast using AWS Cost Explorer.

    * **Description**: This subcommand queries AWS Cost Explorer to get a predicted cost for a future time period.
    * **Parameters**:
        * `--region` (optional, default: `us-east-1`): Specifies the AWS region for Cost Explorer.
        * `--time-period` (required): The start and end date for the forecast period, in `YYYY-MM-DD` format.
        * `--granularity` (optional, default: `MONTHLY`): The time granularity for the forecast (`DAILY`, `MONTHLY`).
        * `--filter` (optional): A JSON string or a path to a JSON file specifying filters to apply to the forecast.
        * `--metric` (optional, default: `UnblendedCost`): The metric to forecast.
        * `--prediction-interval-level` (optional): The confidence interval for the forecast.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

3.  **`list-budgets`**: Lists your AWS budgets.

    * **Description**: This subcommand retrieves a list of all configured AWS budgets.
    * **Parameters**:
        * `--region` (optional, default: `us-east-1`): Specifies the AWS region for Budgets.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

4.  **`describe-budget`**: Describes a specific AWS budget.

    * **Description**: This subcommand retrieves detailed information about a specified AWS budget.
    * **Parameters**:
        * `--region` (optional, default: `us-east-1`): Specifies the AWS region for Budgets.
        * `--budget-name` (required): The name of the budget to describe.
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

5.  **`create-budget`**: Creates a new AWS budget.

    * **Description**: This subcommand allows users to define and create a new AWS budget to track costs or usage.
    * **Parameters**:
        * `--region` (optional, default: `us-east-1`): Specifies the AWS region for Budgets.
        * `--budget-name` (required): The name of the new budget.
        * `--budget-type` (required): The type of budget (`COST` or `USAGE`).
        * `--limit-amount` (required): The limit for the budget (e.g., `100.00`).
        * `--limit-unit` (required): The unit for the limit amount (e.g., `USD`, `GB`).
        * `--time-unit` (required): The period for the budget (`DAILY`, `MONTHLY`, `QUARTERLY`, `ANNUALLY`).
        * `--time-period-start` (required): The start date for the budget in `YYYY-MM-DD` format.
        * `--time-period-end` (optional): The end date for the budget in `YYYY-MM-DD` format (if not recurring).
        * `--cost-filters` (optional): A JSON string or path to a JSON file defining cost filters (e.g., by service, region).
        * `--usage-filters` (optional): A JSON string or path to a JSON file defining usage filters (if `budget-type` is `USAGE`).
        * `--notifications-with-subscribers` (optional): A JSON string or path to a JSON file defining notifications and their subscribers (e.g., email addresses, SNS topic ARNs) and thresholds. Consult the AWS Budgets API documentation for the format.

6.  **`update-budget`**: Updates an existing AWS budget.

    * **Description**: This subcommand allows users to modify the configuration of an existing AWS budget.
    * **Parameters**:
        * `--region` (optional, default: `us-east-1`): Specifies the AWS region for Budgets.
        * `--budget-name` (required): The name of the budget to update.
        * `--new-budget-name` (optional): The new name for the budget.
        * `--limit-amount` (optional): The new limit amount.
        * `--limit-unit` (optional): The new limit unit.
        * `--time-unit` (optional): The new time unit.
        * `--time-period-start` (optional): The new start date.
        * `--time-period-end` (optional): The new end date.
        * `--cost-filters` (optional): The updated cost filters.
        * `--usage-filters` (optional): The updated usage filters.
        * `--notifications-with-subscribers-to-add` (optional): JSON for new notifications and subscribers.
        * `--notifications-with-subscribers-to-update` (optional): JSON for updating existing notifications and subscribers.
        * `--notification-names-to-delete` (optional): A comma-separated list of notification names to delete.

7.  **`delete-budget`**: Deletes a specified AWS budget.

    * **Description**: This subcommand permanently removes an AWS budget.
    * **Parameters**:
        * `--region` (optional, default: `us-east-1`): Specifies the AWS region for Budgets.
        * `--budget-name` (required): The name of the budget to delete.

### Technical Considerations

* **AWS SDK (Boto3):** The tool will primarily use the Boto3 libraries for `costexplorer` and `budgets`.
* **Authentication:** The tool should utilize appropriate AWS credentials configured in the environment.
* **Error Handling:** Implement robust error handling to catch exceptions from the Cost Explorer and Budgets APIs.
* **Output Formatting:** Present the retrieved information in a clear and readable format (`text`, `json`, `table`). Cost data can be complex, so clear formatting is crucial.
* **Command-Line Interface (CLI):** Consider using a library like `argparse` in Python to create a user-friendly command-line interface.
* **Region Awareness:** While Cost Explorer and Budgets have a primary region (`us-east-1`), ensure the tool can handle region configurations appropriately.
* **API Limitations:** Be aware that direct manipulation of billing charges is generally not possible. The focus is on data retrieval and budget management.
* **Cost Explorer Filters and Metrics:** Provide clear guidance or examples on how to use the `--filter` and `--metrics` parameters, as they can be complex. Refer users to the AWS Cost Explorer API documentation.
* **Budget Notification Configuration:** The configuration of budget notifications can be intricate. Provide clear instructions or examples for the `--notifications-with-subscribers` parameter.

This prompt provides a framework for building a tool to interact with AWS billing and cost management services. Remember to consult the Boto3 documentation for `costexplorer` and `budgets` for the specific details of each API call and the available parameters and data structures. Good luck with your development!