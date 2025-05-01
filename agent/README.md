# Deployment Agent

This agent is built using LangGraph.js to handle deployment-related tasks through natural language prompts. It currently focuses on AWS EC2 instance management.

## Features

- **Get EC2 Instances**: Retrieve information about EC2 instances in specific AWS regions
- **Launch EC2 Instances**: Create new EC2 instances with smart defaults

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your AWS credentials:
Make sure your AWS credentials are properly configured for the AWS SDK to access your AWS account.

## Usage

Start the agent:
```bash
npm run start
```

You can interact with the agent using natural language. Examples:

- "Show me all EC2 instances in us-east-1"
- "Launch a new t2.micro instance in us-west-2 with the name 'web-server'"
- "List all instances with tags containing 'production'"

## Architecture

The agent uses LangGraph.js to create a state machine with multiple nodes:
- **Thinking Node**: Decides what to do based on user input
- **EC2 Instances Node**: Retrieves EC2 instance information
- **Launch EC2 Node**: Creates new EC2 instances

The agent uses OpenAI's GPT-4o model for natural language understanding and decision making.

## Requirements

- Node.js 18+
- AWS account with proper permissions
- OpenAI API key (set as OPENAI_API_KEY environment variable)
