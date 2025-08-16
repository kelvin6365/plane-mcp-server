# Plane MCP Server

[![npm version](https://badge.fury.io/js/@disrex%2Fplane-mcp-server.svg)](https://badge.fury.io/js/@disrex%2Fplane-mcp-server)
[![Quality](https://www.archestra.ai/mcp-catalog/api/badge/quality/disrex-group/plane-mcp-server)](https://www.archestra.ai/mcp-catalog/server/plane-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/disrex-group/plane-mcp-server/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/disrex-group/plane-mcp-server/actions/workflows/nodejs-ci.yml)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![Plane.so](https://img.shields.io/badge/Plane.so-Compatible-blue)](https://plane.so)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-green)](https://modelcontextprotocol.io)

A Model Context Protocol (MCP) server that enables LLMs to interact with [Plane.so](https://plane.so), allowing them to manage projects and issues through Plane's API. Using this server, LLMs like Claude can directly interact with your project management workflows while maintaining user control and security.

> **⚠️ Important:** This MCP server is designed specifically for **Plane Cloud** instances. It only works with workspaces hosted on `https://app.plane.so/workspace-slug`. If you're using a self-hosted Plane installation, this server will not be compatible.

> **Note:** This is an enhanced fork of the original [kelvin6365/plane-mcp-server](https://github.com/kelvin6365/plane-mcp-server), extended with comprehensive Plane API functionality including states, modules (sprints), cycles, labels, team management, comments, links, attachments, time tracking, and issue types.

## Features

### Project Management
- List all projects in your Plane workspace
- Get detailed information about specific projects

### Issue Management
- Create new issues with customizable properties
- List and filter issues from projects
- Get detailed information about specific issues
- Update existing issues with new information

### State Management
- List all states in a project
- Get detailed information about specific states
- Create new states with customizable properties
- Update existing states
- Delete states from projects

### Module (Sprint) Management
- List all modules (sprints) in a project
- Get detailed information about specific modules
- Create new modules with customizable properties
- Update existing modules
- Delete modules from projects
- List issues assigned to specific modules
- Add/remove issues to/from modules

### Cycle Management
- List all cycles in a project
- Get detailed information about specific cycles
- Create new cycles with customizable properties
- Update existing cycles
- Delete cycles from projects
- List issues assigned to specific cycles
- Add/remove issues to/from cycles

### Label Management
- List all labels in a project
- Get detailed information about specific labels
- Create new labels with customizable properties
- Update existing labels
- Delete labels from projects

### Team & Workspace Management
- List all members in the workspace
- List members assigned to specific projects

### Issue Comments & Communication
- List, create, update, and delete comments on issues
- Track discussion history and collaboration

### Issue Links & External References
- Attach external links to issues (documentation, PRs, etc.)
- Manage and update issue-related URLs

### File Attachments
- List file attachments for issues
- Generate upload URLs for new attachments

### Issue Activity & History
- View complete activity history for issues
- Track all changes and updates

### Time Tracking (Worklogs)
- Log time spent on specific issues
- View project-wide time tracking summaries
- Update and manage worklog entries

### Custom Issue Types
- Create and manage custom issue types
- Define project-specific issue categories

### Intake Issues (Triage)
- Handle intake/inbox issues for triage
- Manage issue submissions before project assignment

### Custom Issue Properties
- Create and manage custom properties for issue types
- Support for various property types (text, number, date, options, boolean)
- Configure dropdown options for select properties
- Set required fields and validation rules

### Sub-issues & Relations
- Create hierarchical issue structures with parent-child relationships
- Convert existing issues to sub-issues
- List and manage sub-issue trees
- Convert sub-issues back to regular issues

### Issue Transfer Operations
- Transfer issues between cycles for better sprint management
- Bulk move issues to different project phases

## Prerequisites

- Node.js 22.x or higher
- A Plane.so API key
- A Plane.so workspace

## Installation

### Option 1: Using NPM (Recommended)

The quickest way to get started is to use the published npm package:

```json
{
  "mcpServers": {
    "plane": {
      "command": "npx",
      "args": [
        "-y",
        "@disrex/plane-mcp-server"
      ],
      "env": {
        "PLANE_API_KEY": "your_plane_api_key_here",
        "PLANE_WORKSPACE_SLUG": "your_workspace_slug_here"
      }
    }
  }
}
```

Add this configuration to your Claude for Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Option 2: Manual Setup

If you prefer to set up the server manually, follow these steps:

1. Clone this repository:

```bash
git clone https://github.com/disrex-group/plane-mcp-server.git
cd plane-mcp-server
```

2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

## Getting Your Plane API Credentials

To use this MCP server, you'll need:

1. **Plane API Key**: Generate one from your **personal settings** (not workspace settings) in Plane
2. **Workspace Slug**: Found in your Plane workspace URL (e.g., `https://app.plane.so/workspace-slug/`)

After obtaining these credentials, use them in your Claude configuration as shown in the installation options above.

## Available Tools

> **Note:** Tool names use hyphens (e.g., `list-projects`), not underscores. The server will automatically convert underscores to hyphens for compatibility.

### list-projects

Lists all projects in your Plane workspace.

Parameters: None

Example:

```json
{}
```

### get-project

Gets detailed information about a specific project.

Parameters:

- `project_id`: ID of the project to retrieve

Example:

```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

### create-issue

Creates a new issue in a specified project.

Parameters:

- `project_id`: ID of the project where the issue should be created
- `name`: Title of the issue
- `description_html`: HTML description of the issue (required by Plane API)
- `priority` (optional): Priority of the issue ("urgent", "high", "medium", "low", "none")
- `state_id` (optional): ID of the state for this issue
- `assignees` (optional): Array of user IDs to assign to this issue
- `labels` (optional): Array of label IDs to assign to this issue

> **Note:** The `assignees` and `labels` parameters must be arrays of ID strings. Common errors include providing a dictionary/object instead of an array, or accidentally nesting the entire issue data inside these fields. The server will attempt to handle these cases, but it's best to use the correct format.

Example:

```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "name": "Implement new feature",
  "description_html": "<p>We need to implement the new reporting feature</p>",
  "priority": "high",
  "assignees": ["user-id-1", "user-id-2"],
  "labels": ["446cf3ad-446e-4b7a-8706-14121a0338d7", "ab0c39d4-dcae-4ccd-971a-f4c66d1e7db7"]
}
```

### list-issues

Lists issues from a specified project with optional filtering.

Parameters:

- `project_id`: ID of the project to get issues from
- `state_id` (optional): Filter by state ID
- `priority` (optional): Filter by priority
- `assignee_id` (optional): Filter by assignee ID
- `limit` (optional): Maximum number of issues to return (default: 50)

Example:

```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "priority": "high",
  "limit": 10
}
```

### get-issue

Gets detailed information about a specific issue.

Parameters:

- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to retrieve

Example:

```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

### update-issue

Updates an existing issue in a project.

Parameters:

- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to update
- `name` (optional): Updated title of the issue
- `description_html` (optional): HTML description of the issue (required by Plane API)
- `priority` (optional): Updated priority of the issue
- `state_id` (optional): Updated state ID of the issue
- `assignees` (optional): Updated array of user IDs to assign to this issue
- `labels` (optional): Updated array of label IDs to assign to this issue

> **Note:** The `assignees` and `labels` parameters must be arrays of ID strings, following the same format guidelines as the create-issue tool.

Example:

```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "priority": "urgent",
  "description_html": "<p>Updated description with <strong>more details</strong></p>",
  "labels": ["446cf3ad-446e-4b7a-8706-14121a0338d7", "7de2b3d1-ae1a-4651-a3df-717629d70c1a"]
}
```

### State Management Tools

#### list-states

Lists all states in a project.

Parameters:
- `project_id`: ID of the project to get states from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

#### get-state

Gets detailed information about a specific state.

Parameters:
- `project_id`: ID of the project containing the state
- `state_id`: ID of the state to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "state_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### create-state

Creates a new state in a project.

Parameters:
- `project_id`: ID of the project where the state should be created
- `name`: Name of the state
- `group`: State group ("unstarted", "started", "completed", "cancelled")
- `description` (optional): Description of the state
- `color` (optional): Color code for the state (e.g., "#ff0000")

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "name": "In Review",
  "group": "started",
  "description": "Issues currently under review",
  "color": "#ffaa00"
}
```

#### update-state

Updates an existing state in a project.

Parameters:
- `project_id`: ID of the project containing the state
- `state_id`: ID of the state to update
- `name` (optional): Updated name of the state
- `description` (optional): Updated description of the state
- `color` (optional): Updated color code for the state
- `group` (optional): Updated state group

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "state_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "name": "Code Review",
  "color": "#00ff00"
}
```

#### delete-state

Deletes a state from a project.

Parameters:
- `project_id`: ID of the project containing the state
- `state_id`: ID of the state to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "state_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

### Module (Sprint) Management Tools

#### list-modules

Lists all modules (sprints) in a project.

Parameters:
- `project_id`: ID of the project to get modules from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

#### get-module

Gets detailed information about a specific module.

Parameters:
- `project_id`: ID of the project containing the module
- `module_id`: ID of the module to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "module_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### create-module

Creates a new module (sprint) in a project.

Parameters:
- `project_id`: ID of the project where the module should be created
- `name`: Name of the module
- `description` (optional): Description of the module
- `start_date` (optional): Start date of the module (YYYY-MM-DD format)
- `target_date` (optional): Target end date of the module (YYYY-MM-DD format)
- `status` (optional): Status of the module ("planned", "in-progress", "paused", "completed", "cancelled")
- `lead` (optional): User ID of the module lead
- `members` (optional): Array of user IDs to assign as module members

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "name": "Sprint 1 - Core Features",
  "description": "Initial sprint focusing on core functionality",
  "start_date": "2024-01-01",
  "target_date": "2024-01-14",
  "status": "planned",
  "lead": "user-id-1",
  "members": ["user-id-1", "user-id-2"]
}
```

#### update-module

Updates an existing module in a project.

Parameters:
- `project_id`: ID of the project containing the module
- `module_id`: ID of the module to update
- `name` (optional): Updated name of the module
- `description` (optional): Updated description of the module
- `start_date` (optional): Updated start date of the module
- `target_date` (optional): Updated target end date of the module
- `status` (optional): Updated status of the module
- `lead` (optional): Updated user ID of the module lead
- `members` (optional): Updated array of user IDs for module members

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "module_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "status": "in-progress",
  "target_date": "2024-01-21"
}
```

#### delete-module

Deletes a module from a project.

Parameters:
- `project_id`: ID of the project containing the module
- `module_id`: ID of the module to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "module_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### list-module-issues

Lists all issues in a specific module.

Parameters:
- `project_id`: ID of the project containing the module
- `module_id`: ID of the module to get issues from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "module_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### add-issues-to-module

Adds issues to a module.

Parameters:
- `project_id`: ID of the project containing the module
- `module_id`: ID of the module to add issues to
- `issues`: Array of issue IDs to add to the module

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "module_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "issues": ["issue-id-1", "issue-id-2", "issue-id-3"]
}
```

#### remove-issue-from-module

Removes an issue from a module.

Parameters:
- `project_id`: ID of the project containing the module
- `module_id`: ID of the module to remove issue from
- `issue_id`: ID of the issue to remove from the module

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "module_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "issue_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### Cycle Management Tools

#### list-cycles

Lists all cycles in a project.

Parameters:
- `project_id`: ID of the project to get cycles from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

#### get-cycle

Gets detailed information about a specific cycle.

Parameters:
- `project_id`: ID of the project containing the cycle
- `cycle_id`: ID of the cycle to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "cycle_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### create-cycle

Creates a new cycle in a project.

Parameters:
- `project_id`: ID of the project where the cycle should be created
- `name`: Name of the cycle
- `owned_by`: ID of the user who will own this cycle
- `description` (optional): Description of the cycle
- `start_date` (optional): Start date of the cycle (YYYY-MM-DD format)
- `end_date` (optional): End date of the cycle (YYYY-MM-DD format)

Example:
```json
{
  "project_id": "12345678-1234-5678-9abc-123456789def",
  "name": "Q1 2024 Development Cycle",
  "owned_by": "87654321-4321-8765-cba9-987654321fed",
  "description": "First quarter development cycle",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31"
}
```

#### update-cycle

Updates an existing cycle in a project.

Parameters:
- `project_id`: ID of the project containing the cycle
- `cycle_id`: ID of the cycle to update
- `name` (optional): Updated name of the cycle
- `description` (optional): Updated description of the cycle
- `start_date` (optional): Updated start date of the cycle (YYYY-MM-DD format)
- `end_date` (optional): Updated end date of the cycle (YYYY-MM-DD format)

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "cycle_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "name": "Q1 2024 Development Cycle - Updated",
  "end_date": "2024-04-15"
}
```

#### delete-cycle

Deletes a cycle from a project.

Parameters:
- `project_id`: ID of the project containing the cycle
- `cycle_id`: ID of the cycle to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "cycle_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### list-cycle-issues

Lists all issues in a specific cycle.

Parameters:
- `project_id`: ID of the project containing the cycle
- `cycle_id`: ID of the cycle to get issues from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "cycle_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### add-issues-to-cycle

Adds issues to a cycle.

Parameters:
- `project_id`: ID of the project containing the cycle
- `cycle_id`: ID of the cycle to add issues to
- `issues`: Array of issue IDs to add to the cycle

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "cycle_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "issues": ["issue-id-1", "issue-id-2", "issue-id-3"]
}
```

#### remove-issue-from-cycle

Removes an issue from a cycle.

Parameters:
- `project_id`: ID of the project containing the cycle
- `cycle_id`: ID of the cycle to remove issue from
- `issue_id`: ID of the issue to remove from the cycle

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "cycle_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "issue_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### Label Management Tools

#### list-labels

Lists all labels in a project.

Parameters:
- `project_id`: ID of the project to get labels from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

#### get-label

Gets detailed information about a specific label.

Parameters:
- `project_id`: ID of the project containing the label
- `label_id`: ID of the label to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "label_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### create-label

Creates a new label in a project.

Parameters:
- `project_id`: ID of the project where the label should be created
- `name`: Name of the label
- `description` (optional): Description of the label
- `color` (optional): Color code for the label (e.g., "#ff0000")

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "name": "Bug",
  "description": "Issues related to bugs",
  "color": "#ff0000"
}
```

#### update-label

Updates an existing label in a project.

Parameters:
- `project_id`: ID of the project containing the label
- `label_id`: ID of the label to update
- `name` (optional): Updated name of the label
- `description` (optional): Updated description of the label
- `color` (optional): Updated color code for the label (e.g., "#ff0000")

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "label_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "name": "Critical Bug",
  "color": "#ff0000",
  "description": "Issues that require immediate attention"
}
```

#### delete-label

Deletes a label from a project.

Parameters:
- `project_id`: ID of the project containing the label
- `label_id`: ID of the label to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "label_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

### Team & Workspace Management Tools

#### list-workspace-members

Lists all members in the workspace.

Parameters: None

Example:
```json
{}
```

#### list-project-members

Lists all members in a specific project.

Parameters:
- `project_id`: ID of the project to get members from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

### Issue Comments Tools

#### list-issue-comments

Lists all comments on a specific issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to get comments from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### get-issue-comment

Gets detailed information about a specific comment.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the comment
- `comment_id`: ID of the comment to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "comment_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

#### create-issue-comment

Creates a new comment on an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to comment on
- `comment`: The comment text

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "comment": "This looks good, but we need to add unit tests before merging."
}
```

#### update-issue-comment

Updates an existing comment on an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the comment
- `comment_id`: ID of the comment to update
- `comment`: The updated comment text

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "comment_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw",
  "comment": "Updated: This looks good after the latest changes, ready to merge."
}
```

#### delete-issue-comment

Deletes a comment from an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the comment
- `comment_id`: ID of the comment to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "comment_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### Issue Links Tools

#### list-issue-links

Lists all external links attached to an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to get links from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### get-issue-link

Gets detailed information about a specific issue link.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the link
- `link_id`: ID of the link to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "link_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

#### create-issue-link

Creates a new external link for an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to add link to
- `title`: Title/name for the link
- `url`: The URL to link to

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "title": "Related Pull Request",
  "url": "https://github.com/company/repo/pull/123"
}
```

#### update-issue-link

Updates an existing issue link.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the link
- `link_id`: ID of the link to update
- `title` (optional): Updated title/name for the link
- `url` (optional): Updated URL

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "link_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw",
  "title": "Updated Documentation Link",
  "url": "https://docs.example.com/updated-section"
}
```

#### delete-issue-link

Deletes an external link from an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the link
- `link_id`: ID of the link to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "link_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### Issue Attachments Tools

#### list-issue-attachments

Lists all file attachments for an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to get attachments from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### get-issue-attachment-upload-url

Gets a pre-signed URL for uploading file attachments to an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to attach file to
- `file_name`: Name of the file to upload
- `file_size`: Size of the file in bytes
- `content_type`: MIME type of the file (e.g., 'image/png', 'application/pdf')

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "file_name": "screenshot.png",
  "file_size": 1024000,
  "content_type": "image/png"
}
```

### Issue Activities Tools

#### list-issue-activities

Lists all activities/history for an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to get activities from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### get-issue-activity

Gets detailed information about a specific issue activity.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the activity
- `activity_id`: ID of the activity to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "activity_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### Worklogs (Time Tracking) Tools

#### list-issue-worklogs

Lists all time logs for a specific issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to get worklogs from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### get-project-total-worklogs

Gets total time logged across all issues in a project.

Parameters:
- `project_id`: ID of the project to get total worklogs from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

#### create-issue-worklog

Creates a new time log entry for an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue to log time for
- `duration`: Time logged in hours (e.g., 2.5 for 2 hours 30 minutes)
- `description` (optional): Description of the work done

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "duration": 3.5,
  "description": "Fixed the authentication bug and added unit tests"
}
```

#### update-issue-worklog

Updates an existing worklog entry.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the worklog
- `worklog_id`: ID of the worklog to update
- `duration` (optional): Updated time logged in hours
- `description` (optional): Updated description of the work done

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "worklog_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw",
  "duration": 4.0,
  "description": "Fixed critical bug and updated documentation"
}
```

#### delete-issue-worklog

Deletes a worklog entry from an issue.

Parameters:
- `project_id`: ID of the project containing the issue
- `issue_id`: ID of the issue containing the worklog
- `worklog_id`: ID of the worklog to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "worklog_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### Issue Types Tools

#### list-issue-types

Lists all custom issue types in a project.

Parameters:
- `project_id`: ID of the project to get issue types from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

#### get-issue-type

Gets detailed information about a specific issue type.

Parameters:
- `project_id`: ID of the project containing the issue type
- `type_id`: ID of the issue type to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "type_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### create-issue-type

Creates a new custom issue type in a project.

Parameters:
- `project_id`: ID of the project to create issue type in
- `name`: Name of the issue type
- `description` (optional): Description of the issue type

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "name": "Epic",
  "description": "Large feature that spans multiple sprints"
}
```

#### update-issue-type

Updates an existing issue type.

Parameters:
- `project_id`: ID of the project containing the issue type
- `type_id`: ID of the issue type to update
- `name` (optional): Updated name of the issue type
- `description` (optional): Updated description

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "type_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "name": "Major Epic",
  "description": "Large feature spanning multiple quarters"
}
```

#### delete-issue-type

Deletes an issue type from a project.

Parameters:
- `project_id`: ID of the project containing the issue type
- `type_id`: ID of the issue type to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "type_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

### Intake Issues Tools

#### list-intake-issues

Lists all intake/inbox issues in a project.

Parameters:
- `project_id`: ID of the project to get intake issues from

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef"
}
```

#### get-intake-issue

Gets detailed information about a specific intake issue.

Parameters:
- `project_id`: ID of the project containing the intake issue
- `issue_id`: ID of the intake issue to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

#### create-intake-issue

Creates a new intake/inbox issue.

Parameters:
- `project_id`: ID of the project to create intake issue in
- `name`: Title of the intake issue
- `description_html` (optional): HTML description of the issue
- `priority` (optional): Priority of the issue ("urgent", "high", "medium", "low", "none")

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "name": "User reports login issues on mobile app",
  "description_html": "<p>Multiple users experiencing login failures on iOS app version 2.1.3</p>",
  "priority": "high"
}
```

#### update-intake-issue

Updates an existing intake issue.

Parameters:
- `project_id`: ID of the project containing the intake issue
- `issue_id`: ID of the intake issue to update
- `name` (optional): Updated title
- `description_html` (optional): Updated HTML description
- `priority` (optional): Updated priority

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "name": "Updated: Multiple users experiencing login issues on mobile app",
  "priority": "urgent",
  "description_html": "<p>Updated: Now affecting Android users as well as iOS. Version 2.1.3 and 2.1.4</p>"
}
```

#### delete-intake-issue

Deletes an intake issue.

Parameters:
- `project_id`: ID of the project containing the intake issue
- `issue_id`: ID of the intake issue to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

### list-issue-properties

Lists all custom properties for a specific issue type.

Parameters:
- `project_id`: ID of the project
- `type_id`: ID of the issue type to get properties for

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "type_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

### get-issue-property

Gets details of a specific issue property.

Parameters:
- `project_id`: ID of the project
- `type_id`: ID of the issue type
- `property_id`: ID of the property to retrieve

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "type_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "property_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### create-issue-property

Creates a new custom property for an issue type.

Parameters:
- `project_id`: ID of the project
- `type_id`: ID of the issue type
- `name`: Internal name for the property
- `display_name`: Display name for the property
- `property_type`: Type of property (TEXT, NUMBER, DATE, OPTION, MULTI_OPTION, BOOLEAN)
- `description`: Description of the property (optional)
- `is_required`: Whether this property is required (optional)
- `is_multi`: Whether multiple values are allowed (optional)

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "type_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "name": "severity",
  "display_name": "Bug Severity",
  "property_type": "OPTION",
  "description": "Severity level of the bug",
  "is_required": true,
  "is_multi": false
}
```

### update-issue-property

Updates an existing issue property.

Parameters:
- `project_id`: ID of the project
- `type_id`: ID of the issue type
- `property_id`: ID of the property to update
- `name`: Internal name for the property (optional)
- `display_name`: Display name for the property (optional)
- `description`: Description of the property (optional)
- `is_required`: Whether this property is required (optional)
- `is_multi`: Whether multiple values are allowed (optional)

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "type_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "property_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw",
  "display_name": "Bug Severity Level",
  "description": "Updated severity level description"
}
```

### delete-issue-property

Deletes an issue property.

Parameters:
- `project_id`: ID of the project
- `type_id`: ID of the issue type
- `property_id`: ID of the property to delete

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "type_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "property_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### list-issue-property-options

Lists all options for a dropdown/select issue property.

Parameters:
- `project_id`: ID of the project
- `property_id`: ID of the property to get options for

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "property_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### create-issue-property-option

Creates a new option for a dropdown/select issue property.

Parameters:
- `project_id`: ID of the project
- `property_id`: ID of the property to add option to
- `name`: Name of the option
- `description`: Description of the option (optional)
- `sort_order`: Sort order for the option (optional)
- `is_default`: Whether this is the default option (optional)

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "property_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw",
  "name": "Critical",
  "description": "Critical severity level",
  "sort_order": 1,
  "is_default": false
}
```

### update-issue-property-option

Updates an option for a dropdown/select issue property.

Parameters:
- `project_id`: ID of the project
- `property_id`: ID of the property
- `option_id`: ID of the option to update
- `name`: Name of the option (optional)
- `description`: Description of the option (optional)
- `sort_order`: Sort order for the option (optional)
- `is_default`: Whether this is the default option (optional)

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "property_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw",
  "option_id": "01jkl012-3456-78mn-9012-opqrstuvwxyz",
  "name": "High Priority",
  "description": "High priority severity level"
}
```

### list-sub-issues

Lists all sub-issues of a parent issue.

Parameters:
- `project_id`: ID of the project
- `parent_issue_id`: ID of the parent issue to get sub-issues for

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "parent_issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

### create-sub-issue

Creates a new sub-issue under a parent issue.

Parameters:
- `project_id`: ID of the project
- `parent_issue_id`: ID of the parent issue
- `name`: Title of the sub-issue
- `description_html`: HTML description of the sub-issue (optional)
- `priority`: Priority of the sub-issue (urgent, high, medium, low, none) (optional)
- `state_id`: ID of the state for this sub-issue (optional)
- `assignees`: Array of user IDs to assign to this sub-issue (optional)

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "parent_issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "name": "Fix validation bug",
  "description_html": "<p>Fix the email validation issue in the login form</p>",
  "priority": "high"
}
```

### convert-to-sub-issue

Converts an existing issue to a sub-issue of another issue.

Parameters:
- `project_id`: ID of the project
- `issue_id`: ID of the issue to convert to sub-issue
- `parent_issue_id`: ID of the parent issue

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw",
  "parent_issue_id": "01def456-7890-12gh-3456-789ijklmnopq"
}
```

### convert-to-issue

Converts a sub-issue back to a regular issue (removes parent relationship).

Parameters:
- `project_id`: ID of the project
- `issue_id`: ID of the sub-issue to convert to regular issue

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

### transfer-issues

Transfers issues from one cycle to another.

Parameters:
- `project_id`: ID of the project
- `cycle_id`: ID of the source cycle to transfer issues from
- `new_cycle_id`: ID of the target cycle to transfer issues to

Example:
```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "cycle_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "new_cycle_id": "01ghi789-0123-45jk-6789-lmnopqrstuvw"
}
```

## Development

1. Install development dependencies:

```bash
npm install --save-dev typescript @types/node
```

2. Start the server in development mode:

```bash
npm run dev
```

## Testing

You can test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Examples

Here are some example interactions you can try with Claude after setting up the Plane MCP server:

### Basic Project & Issue Management
1. "Can you list all the projects in my Plane workspace?"
2. "Please create a new high-priority issue in the Marketing project titled 'Update social media strategy'"
3. "What are all the high-priority issues in the Development project?"
4. "Update issue #123 in the QA project to change its priority to urgent"

### Sprint/Module Management
5. "Create a new sprint called 'Q1 2024 Features' in the Development project with a 2-week duration"
6. "Show me all the issues in the current sprint for the Backend project"
7. "Add issues #456 and #789 to the 'API Development' module"
8. "What sprints are currently active in the project?"

### Workflow & State Management
9. "List all the workflow states available in the Frontend project"
10. "Create a new state called 'Code Review' for the Backend project"
11. "Move issue #123 to the 'In Progress' state"

### Cycle & Planning Management
12. "Create a development cycle for Q1 2024 from January 1st to March 31st"
13. "Show me all issues assigned to the current development cycle"
14. "Add the high-priority issues to the 'Release Preparation' cycle"

### Label & Organization
15. "List all available labels in the project and create a new 'Security' label"
16. "Apply the 'Bug' and 'High Priority' labels to issue #789"

### Team & Member Management
17. "Who are all the members in this workspace?"
18. "Show me the team members assigned to the Backend project"
19. "List all issues assigned to John in the current sprint"

### Advanced Workflows
20. "Create a new sprint, add 5 specific issues to it, and set it to start next Monday"
21. "Show me all overdue issues across all projects and their current states"
22. "Create a comprehensive project status report with issues, sprints, and team assignments"

Claude will use the appropriate tools to interact with Plane while asking for your approval before creating or modifying any data.

## Security Considerations

- The API key requires proper Plane permissions to function
- All operations that modify data require explicit user approval
- Environment variables should be properly secured
- API keys should never be committed to version control

## Contributing

1. Fork the repository from [disrex-group/plane-mcp-server](https://github.com/disrex-group/plane-mcp-server)
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Badges

This project uses several badges to provide quick information about status, quality, and compatibility:

### Available Badges

- **NPM Version**: Shows the latest published version on npm
  ```markdown
  [![npm version](https://badge.fury.io/js/@disrex%2Fplane-mcp-server.svg)](https://badge.fury.io/js/@disrex%2Fplane-mcp-server)
  ```

- **MCP Catalog Quality**: Quality score from the Archestra.ai MCP catalog
  ```markdown
  [![Quality](https://www.archestra.ai/mcp-catalog/api/badge/quality/disrex-group/plane-mcp-server)](https://www.archestra.ai/mcp-catalog/server/plane-mcp-server)
  ```

- **License**: MIT License badge
  ```markdown
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  ```

- **CI Status**: GitHub Actions workflow status
  ```markdown
  [![Node.js CI](https://github.com/disrex-group/plane-mcp-server/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/disrex-group/plane-mcp-server/actions/workflows/nodejs-ci.yml)
  ```

- **TypeScript**: Technology badge
  ```markdown
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
  ```

- **Plane.so Compatibility**: Custom compatibility badge
  ```markdown
  [![Plane.so](https://img.shields.io/badge/Plane.so-Compatible-blue)](https://plane.so)
  ```

- **MCP Protocol**: Model Context Protocol badge
  ```markdown
  [![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-green)](https://modelcontextprotocol.io)
  ```

### Creating Custom Badges

You can create custom badges using [Shields.io](https://shields.io/):

1. **Basic Format**: `https://img.shields.io/badge/{label}-{message}-{color}`
2. **Dynamic Badges**: Use endpoints for live data (npm downloads, GitHub stars, etc.)
3. **Style Options**: Add `?style=flat-square`, `?style=for-the-badge`, etc.

Example custom badge:
```markdown
[![Custom Badge](https://img.shields.io/badge/Custom-Message-brightgreen)](https://your-link.com)
```

### Badge Services

- **[Shields.io](https://shields.io/)**: The most comprehensive badge service
- **[Badge Fury](https://badge.fury.io/)**: Specifically for package managers
- **[Archestra.ai MCP Catalog](https://www.archestra.ai/mcp-catalog/)**: Quality badges for MCP servers
- **GitHub Actions**: Automatic CI/CD status badges

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues section](https://github.com/disrex-group/plane-mcp-server/issues)
2. Consult the MCP documentation at [modelcontextprotocol.io](https://modelcontextprotocol.io)
3. Open a new issue with detailed reproduction steps

## Repository History

This enhanced fork builds upon the excellent foundation of the original [kelvin6365/plane-mcp-server](https://github.com/kelvin6365/plane-mcp-server), adding comprehensive project management capabilities.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=disrex-group/plane-mcp-server&type=Date)](https://www.star-history.com/#disrex-group/plane-mcp-server&Date)
