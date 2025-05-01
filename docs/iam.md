# Prompt for Building Detailed AWS IAM Management Tools

## Tool: IAM Management Tool (`aws-iam-manager`)

### Description

The `aws-iam-manager` tool is designed to provide comprehensive management capabilities for AWS Identity and Access Management (IAM) resources, including users, groups, roles, policies, and instance profiles. It allows users to perform a wide range of actions, from listing and describing IAM entities to creating, modifying, attaching, detaching, and deleting these resources. This tool aims to simplify the interaction with IAM, making it easier to manage access and permissions within your AWS account.

### Subcommands and Parameters

1.  **`list-users`**: Retrieves and displays a detailed list of IAM users.

    * **Description**: This subcommand fetches all IAM users in your AWS account and presents their key attributes.
    * **Parameters**:
        * `--path-prefix` (optional): If provided, lists only users whose paths begin with the specified prefix.
        * `--output-format` (optional): Specifies the desired output format. Supported values could include `text` (default, human-readable text output), `json` (JSON formatted output), or `table` (formatted table output).

2.  **`get-user`**: Displays detailed information about a specific IAM user.

    * **Description**: This subcommand retrieves and shows all configuration details of a given IAM user.
    * **Parameters**:
        * `--user-name` (required): Specifies the name of the IAM user (e.g., `my-user`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

3.  **`create-user`**: Creates a new IAM user.

    * **Description**: This subcommand allows users to define and create a new IAM user.
    * **Parameters**:
        * `--user-name` (required): The name of the new IAM user (e.g., `new-user`).
        * `--path` (optional, default: `/`): The path for the IAM user.
        * `--permissions-boundary` (optional): The ARN of the policy that is used to set the permissions boundary for the user.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new user (e.g., `--tags "Environment=Development" "Team=Developers"`).

4.  **`delete-user`**: Deletes a specified IAM user.

    * **Description**: This subcommand permanently removes an IAM user. **Note:** The user must have no attached policies, belong to no groups, and have no signing certificates, SSH keys, or access keys before it can be deleted.
    * **Parameters**:
        * `--user-name` (required): The name of the IAM user to delete.

5.  **`list-groups`**: Retrieves and displays a detailed list of IAM groups.

    * **Description**: This subcommand fetches all IAM groups in your AWS account and presents their key attributes.
    * **Parameters**:
        * `--path-prefix` (optional): If provided, lists only groups whose paths begin with the specified prefix.
        * `--output-format` (optional): Specifies the desired output format (`text`, `json`, `table`).

6.  **`get-group`**: Displays detailed information about a specific IAM group.

    * **Description**: This subcommand retrieves and shows all configuration details of a given IAM group, including the users in the group and the policies attached to the group.
    * **Parameters**:
        * `--group-name` (required): Specifies the name of the IAM group (e.g., `my-group`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

7.  **`create-group`**: Creates a new IAM group.

    * **Description**: This subcommand allows users to define and create a new IAM group.
    * **Parameters**:
        * `--group-name` (required): The name of the new IAM group (e.g., `new-group`).
        * `--path` (optional, default: `/`): The path for the IAM group.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new group.

8.  **`delete-group`**: Deletes a specified IAM group.

    * **Description**: This subcommand permanently removes an IAM group. **Note:** The group must have no users in it and no attached policies before it can be deleted.
    * **Parameters**:
        * `--group-name` (required): The name of the IAM group to delete.

9.  **`add-user-to-group`**: Adds a specified IAM user to a specified IAM group.

    * **Description**: This subcommand adds an existing IAM user to an existing IAM group.
    * **Parameters**:
        * `--user-name` (required): The name of the IAM user to add.
        * `--group-name` (required): The name of the IAM group to add the user to.

10. **`remove-user-from-group`**: Removes a specified IAM user from a specified IAM group.

    * **Description**: This subcommand removes an existing IAM user from an existing IAM group.
    * **Parameters**:
        * `--user-name` (required): The name of the IAM user to remove.
        * `--group-name` (required): The name of the IAM group to remove the user from.

11. **`list-roles`**: Retrieves and displays a detailed list of IAM roles.

    * **Description**: This subcommand fetches all IAM roles in your AWS account and presents their key attributes.
    * **Parameters**:
        * `--path-prefix` (optional): If provided, lists only roles whose paths begin with the specified prefix.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

12. **`get-role`**: Displays detailed information about a specific IAM role.

    * **Description**: This subcommand retrieves and shows all configuration details of a given IAM role, including its trust policy and attached policies.
    * **Parameters**:
        * `--role-name` (required): Specifies the name of the IAM role (e.g., `my-role`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

13. **`create-role`**: Creates a new IAM role.

    * **Description**: This subcommand allows users to define and create a new IAM role.
    * **Parameters**:
        * `--role-name` (required): The name of the new IAM role (e.g., `new-role`).
        * `--assume-role-policy-document` (required): The trust policy document that specifies who can assume the role. This should be a JSON string or a path to a JSON file.
        * `--path` (optional, default: `/`): The path for the IAM role.
        * `--permissions-boundary` (optional): The ARN of the policy that is used to set the permissions boundary for the role.
        * `--description` (optional): A description of the role.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new role.

14. **`delete-role`**: Deletes a specified IAM role.

    * **Description**: This subcommand permanently removes an IAM role. **Note:** The role must have no attached policies or instance profiles before it can be deleted.
    * **Parameters**:
        * `--role-name` (required): The name of the IAM role to delete.

15. **`list-policies`**: Retrieves and displays a detailed list of IAM policies.

    * **Description**: This subcommand fetches all IAM policies in your AWS account. You can filter by scope (AWS or customer managed) and path prefix.
    * **Parameters**:
        * `--scope` (optional, default: `All`): Filters the results to only AWS managed policies (`AWS`), customer managed policies (`Local`), or all policies (`All`).
        * `--path-prefix` (optional): If provided, lists only policies whose paths begin with the specified prefix.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

16. **`get-policy`**: Displays metadata about a specific IAM policy.

    * **Description**: This subcommand retrieves and shows metadata for a given IAM policy. To see the policy document, use `get-policy-version`.
    * **Parameters**:
        * `--policy-arn` (required): The ARN of the IAM policy (e.g., `arn:aws:iam::123456789012:policy/my-policy`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

17.  **`get-policy-version`**: Displays the document of a specific version of an IAM policy.

    * **Description**: This subcommand retrieves and shows the policy document for a specific version of a given IAM policy.
    * **Parameters**:
        * `--policy-arn` (required): The ARN of the IAM policy.
        * `--version-id` (required): The identifier of the policy version to retrieve (e.g., `v1`, `v2`).
        * `--output-format` (optional): Specifies the output format (`text`, `json`).

18. **`create-policy`**: Creates a new IAM policy.

    * **Description**: This subcommand allows users to define and create a new IAM policy.
    * **Parameters**:
        * `--policy-name` (required): The name of the new IAM policy (e.g., `new-policy`).
        * `--policy-document` (required): The policy document that defines the permissions. This should be a JSON string or a path to a JSON file.
        * `--path` (optional, default: `/`): The path for the IAM policy.
        * `--description` (optional): A description of the policy.
        * `--tags` (optional): A list of key-value pairs to assign as tags to the new policy.

19. **`delete-policy`**: Deletes a specified IAM policy.

    * **Description**: This subcommand permanently removes an IAM policy. **Note:** The policy must not be attached to any users, groups, or roles before it can be deleted.
    * **Parameters**:
        * `--policy-arn` (required): The ARN of the IAM policy to delete.

20. **`attach-user-policy`**: Attaches a managed policy to a specified IAM user.

    * **Description**: This subcommand attaches an existing IAM managed policy to a specified IAM user.
    * **Parameters**:
        * `--user-name` (required): The name of the IAM user to attach the policy to.
        * `--policy-arn` (required): The ARN of the IAM policy to attach.

21. **`detach-user-policy`**: Detaches a managed policy from a specified IAM user.

    * **Description**: This subcommand detaches an IAM managed policy from a specified IAM user.
    * **Parameters**:
        * `--user-name` (required): The name of the IAM user to detach the policy from.
        * `--policy-arn` (required): The ARN of the IAM policy to detach.

22. **`attach-group-policy`**: Attaches a managed policy to a specified IAM group.

    * **Description**: This subcommand attaches an existing IAM managed policy to a specified IAM group.
    * **Parameters**:
        * `--group-name` (required): The name of the IAM group to attach the policy to.
        * `--policy-arn` (required): The ARN of the IAM policy to attach.

23. **`detach-group-policy`**: Detaches a managed policy from a specified IAM group.

    * **Description**: This subcommand detaches an IAM managed policy from a specified IAM group.
    * **Parameters**:
        * `--group-name` (required): The name of the IAM group to detach the policy from.
        * `--policy-arn` (required): The ARN of the IAM policy to detach.

24. **`attach-role-policy`**: Attaches a managed policy to a specified IAM role.

    * **Description**: This subcommand attaches an existing IAM managed policy to a specified IAM role.
    * **Parameters**:
        * `--role-name` (required): The name of the IAM role to attach the policy to.
        * `--policy-arn` (required): The ARN of the IAM policy to attach.

25. **`detach-role-policy`**: Detaches a managed policy from a specified IAM role.

    * **Description**: This subcommand detaches an IAM managed policy from a specified IAM role.
    * **Parameters**:
        * `--role-name` (required): The name of the IAM role to detach the policy from.
        * `--policy-arn` (required): The ARN of the IAM policy to detach.

26. **`list-attached-user-policies`**: Lists the managed policies attached to a specified IAM user.

    * **Description**: This subcommand retrieves and displays the managed policies attached to a given IAM user.
    * **Parameters**:
        * `--user-name` (required): The name of the IAM user.
        * `--path-prefix` (optional): Filters the results based on the path prefix for the policies.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

27. **`list-attached-group-policies`**: Lists the managed policies attached to a specified IAM group.

    * **Description**: This subcommand retrieves and displays the managed policies attached to a given IAM group.
    * **Parameters**:
        * `--group-name` (required): The name of the IAM group.
        * `--path-prefix` (optional): Filters the results based on the path prefix for the policies.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).

28. **`list-attached-role-policies`**: Lists the managed policies attached to a specified IAM role.

    * **Description**: This subcommand retrieves and displays the managed policies attached to a given IAM role.
    * **Parameters**:
        * `--role-name` (required): The name of the IAM role.
        * `--path-prefix` (optional): Filters the results based on the path prefix for the policies.
        * `--output-format` (optional): Specifies the output format (`text`, `json`, `table`).
