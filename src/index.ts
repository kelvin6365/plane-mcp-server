#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Retrieve the Plane API key from environment variables
const PLANE_API_KEY = process.env.PLANE_API_KEY;
const PLANE_WORKSPACE_SLUG = process.env.PLANE_WORKSPACE_SLUG;

if (!PLANE_API_KEY) {
  console.error("Error: PLANE_API_KEY environment variable is required");
  process.exit(1);
}

if (!PLANE_WORKSPACE_SLUG) {
  console.error("Error: PLANE_WORKSPACE_SLUG environment variable is required");
  process.exit(1);
}

// Define tools
const LIST_PROJECTS_TOOL: Tool = {
  name: "list-projects",
  description: "List all projects in the workspace",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

const GET_PROJECT_TOOL: Tool = {
  name: "get-project",
  description: "Get detailed information about a specific project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to retrieve",
      },
    },
    required: ["project_id"],
  },
};

const CREATE_ISSUE_TOOL: Tool = {
  name: "create-issue",
  description: "Create a new issue in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project where the issue should be created",
      },
      name: {
        type: "string",
        description: "Title of the issue",
      },
      description_html: {
        type: "string",
        description: "HTML description of the issue (required by Plane API)",
      },
      priority: {
        type: "string",
        description: "Priority of the issue (urgent, high, medium, low, none)",
        enum: ["urgent", "high", "medium", "low", "none"],
      },
      state_id: {
        type: "string",
        description: "ID of the state for this issue (optional)",
      },
      assignees: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of user IDs to assign to this issue (optional)",
      },
      labels: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of label IDs to assign to this issue (optional)",
      },
    },
    required: ["project_id", "name"],
  },
};

const LIST_ISSUES_TOOL: Tool = {
  name: "list-issues",
  description: "List issues from a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get issues from",
      },
      state_id: {
        type: "string",
        description: "Filter by state ID (optional)",
      },
      priority: {
        type: "string",
        description: "Filter by priority (optional)",
        enum: ["urgent", "high", "medium", "low", "none"],
      },
      assignee_id: {
        type: "string",
        description: "Filter by assignee ID (optional)",
      },
      limit: {
        type: "number",
        description: "Maximum number of issues to return (default: 50)",
      },
    },
    required: ["project_id"],
  },
};

const GET_ISSUE_TOOL: Tool = {
  name: "get-issue",
  description: "Get detailed information about a specific issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to retrieve",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

const UPDATE_ISSUE_TOOL: Tool = {
  name: "update-issue",
  description:
    "Update an existing issue in a project, delete just update the issue title with 'delete' or 'remove'",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to update",
      },
      name: {
        type: "string",
        description: "Updated title of the issue (optional)",
      },
      description_html: {
        type: "string",
        description: "HTML description of the issue (required by Plane API)",
      },
      priority: {
        type: "string",
        description: "Updated priority of the issue (optional)",
        enum: ["urgent", "high", "medium", "low", "none"],
      },
      state_id: {
        type: "string",
        description: "Updated state ID of the issue (optional)",
      },
      assignees: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "Updated array of user IDs to assign to this issue (optional)",
      },
      labels: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "Updated array of label IDs to assign to this issue (optional)",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

// State Management Tools
const LIST_STATES_TOOL: Tool = {
  name: "list-states",
  description: "List all states in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get states from",
      },
    },
    required: ["project_id"],
  },
};

const GET_STATE_TOOL: Tool = {
  name: "get-state",
  description: "Get detailed information about a specific state",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the state",
      },
      state_id: {
        type: "string",
        description: "ID of the state to retrieve",
      },
    },
    required: ["project_id", "state_id"],
  },
};

const CREATE_STATE_TOOL: Tool = {
  name: "create-state",
  description: "Create a new state in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project where the state should be created",
      },
      name: {
        type: "string",
        description: "Name of the state",
      },
      description: {
        type: "string",
        description: "Description of the state (optional)",
      },
      color: {
        type: "string",
        description: "Color code for the state (optional, e.g., #ff0000)",
      },
      group: {
        type: "string",
        description: "State group (unstarted, started, completed, cancelled)",
        enum: ["unstarted", "started", "completed", "cancelled"],
      },
    },
    required: ["project_id", "name", "group"],
  },
};

const UPDATE_STATE_TOOL: Tool = {
  name: "update-state",
  description: "Update an existing state in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the state",
      },
      state_id: {
        type: "string",
        description: "ID of the state to update",
      },
      name: {
        type: "string",
        description: "Updated name of the state (optional)",
      },
      description: {
        type: "string",
        description: "Updated description of the state (optional)",
      },
      color: {
        type: "string",
        description: "Updated color code for the state (optional)",
      },
      group: {
        type: "string",
        description: "Updated state group (optional)",
        enum: ["unstarted", "started", "completed", "cancelled"],
      },
    },
    required: ["project_id", "state_id"],
  },
};

const DELETE_STATE_TOOL: Tool = {
  name: "delete-state",
  description: "Delete a state from a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the state",
      },
      state_id: {
        type: "string",
        description: "ID of the state to delete",
      },
    },
    required: ["project_id", "state_id"],
  },
};

// Module (Sprint) Management Tools
const LIST_MODULES_TOOL: Tool = {
  name: "list-modules",
  description: "List all modules (sprints) in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get modules from",
      },
    },
    required: ["project_id"],
  },
};

const GET_MODULE_TOOL: Tool = {
  name: "get-module",
  description: "Get detailed information about a specific module",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the module",
      },
      module_id: {
        type: "string",
        description: "ID of the module to retrieve",
      },
    },
    required: ["project_id", "module_id"],
  },
};

const CREATE_MODULE_TOOL: Tool = {
  name: "create-module",
  description: "Create a new module (sprint) in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project where the module should be created",
      },
      name: {
        type: "string",
        description: "Name of the module",
      },
      description: {
        type: "string",
        description: "Description of the module (optional)",
      },
      start_date: {
        type: "string",
        description: "Start date of the module (YYYY-MM-DD format, optional)",
      },
      target_date: {
        type: "string",
        description: "Target end date of the module (YYYY-MM-DD format, optional)",
      },
      status: {
        type: "string",
        description: "Status of the module",
        enum: ["planned", "in-progress", "paused", "completed", "cancelled"],
      },
      lead: {
        type: "string",
        description: "User ID of the module lead (optional)",
      },
      members: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of user IDs to assign as module members (optional)",
      },
    },
    required: ["project_id", "name"],
  },
};

const UPDATE_MODULE_TOOL: Tool = {
  name: "update-module",
  description: "Update an existing module in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the module",
      },
      module_id: {
        type: "string",
        description: "ID of the module to update",
      },
      name: {
        type: "string",
        description: "Updated name of the module (optional)",
      },
      description: {
        type: "string",
        description: "Updated description of the module (optional)",
      },
      start_date: {
        type: "string",
        description: "Updated start date of the module (YYYY-MM-DD format, optional)",
      },
      target_date: {
        type: "string",
        description: "Updated target end date of the module (YYYY-MM-DD format, optional)",
      },
      status: {
        type: "string",
        description: "Updated status of the module (optional)",
        enum: ["planned", "in-progress", "paused", "completed", "cancelled"],
      },
      lead: {
        type: "string",
        description: "Updated user ID of the module lead (optional)",
      },
      members: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Updated array of user IDs for module members (optional)",
      },
    },
    required: ["project_id", "module_id"],
  },
};

const DELETE_MODULE_TOOL: Tool = {
  name: "delete-module",
  description: "Delete a module from a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the module",
      },
      module_id: {
        type: "string",
        description: "ID of the module to delete",
      },
    },
    required: ["project_id", "module_id"],
  },
};

const LIST_MODULE_ISSUES_TOOL: Tool = {
  name: "list-module-issues",
  description: "List all issues in a specific module",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the module",
      },
      module_id: {
        type: "string",
        description: "ID of the module to get issues from",
      },
    },
    required: ["project_id", "module_id"],
  },
};

const ADD_ISSUES_TO_MODULE_TOOL: Tool = {
  name: "add-issues-to-module",
  description: "Add issues to a module",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the module",
      },
      module_id: {
        type: "string",
        description: "ID of the module to add issues to",
      },
      issues: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of issue IDs to add to the module",
      },
    },
    required: ["project_id", "module_id", "issues"],
  },
};

const REMOVE_ISSUE_FROM_MODULE_TOOL: Tool = {
  name: "remove-issue-from-module",
  description: "Remove an issue from a module",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the module",
      },
      module_id: {
        type: "string",
        description: "ID of the module to remove issue from",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to remove from the module",
      },
    },
    required: ["project_id", "module_id", "issue_id"],
  },
};

// Cycle Management Tools
const LIST_CYCLES_TOOL: Tool = {
  name: "list-cycles",
  description: "List all cycles in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get cycles from",
      },
    },
    required: ["project_id"],
  },
};

const GET_CYCLE_TOOL: Tool = {
  name: "get-cycle",
  description: "Get detailed information about a specific cycle",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the cycle",
      },
      cycle_id: {
        type: "string",
        description: "ID of the cycle to retrieve",
      },
    },
    required: ["project_id", "cycle_id"],
  },
};

const CREATE_CYCLE_TOOL: Tool = {
  name: "create-cycle",
  description: "Create a new cycle in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project where the cycle should be created",
      },
      name: {
        type: "string",
        description: "Name of the cycle",
      },
      description: {
        type: "string",
        description: "Description of the cycle (optional)",
      },
      start_date: {
        type: "string",
        description: "Start date of the cycle (YYYY-MM-DD format, optional)",
      },
      end_date: {
        type: "string",
        description: "End date of the cycle (YYYY-MM-DD format, optional)",
      },
      owned_by: {
        type: "string",
        description: "ID of the user who will own this cycle",
      },
    },
    required: ["project_id", "name", "owned_by"],
  },
};

const UPDATE_CYCLE_TOOL: Tool = {
  name: "update-cycle",
  description: "Update an existing cycle in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the cycle",
      },
      cycle_id: {
        type: "string",
        description: "ID of the cycle to update",
      },
      name: {
        type: "string",
        description: "Updated name of the cycle (optional)",
      },
      description: {
        type: "string",
        description: "Updated description of the cycle (optional)",
      },
      start_date: {
        type: "string",
        description: "Updated start date of the cycle (YYYY-MM-DD format, optional)",
      },
      end_date: {
        type: "string",
        description: "Updated end date of the cycle (YYYY-MM-DD format, optional)",
      },
    },
    required: ["project_id", "cycle_id"],
  },
};

const DELETE_CYCLE_TOOL: Tool = {
  name: "delete-cycle",
  description: "Delete a cycle from a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the cycle",
      },
      cycle_id: {
        type: "string",
        description: "ID of the cycle to delete",
      },
    },
    required: ["project_id", "cycle_id"],
  },
};

const LIST_CYCLE_ISSUES_TOOL: Tool = {
  name: "list-cycle-issues",
  description: "List all issues in a specific cycle",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the cycle",
      },
      cycle_id: {
        type: "string",
        description: "ID of the cycle to get issues from",
      },
    },
    required: ["project_id", "cycle_id"],
  },
};

const ADD_ISSUES_TO_CYCLE_TOOL: Tool = {
  name: "add-issues-to-cycle",
  description: "Add issues to a cycle",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the cycle",
      },
      cycle_id: {
        type: "string",
        description: "ID of the cycle to add issues to",
      },
      issues: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of issue IDs to add to the cycle",
      },
    },
    required: ["project_id", "cycle_id", "issues"],
  },
};

const REMOVE_ISSUE_FROM_CYCLE_TOOL: Tool = {
  name: "remove-issue-from-cycle",
  description: "Remove an issue from a cycle",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the cycle",
      },
      cycle_id: {
        type: "string",
        description: "ID of the cycle to remove issue from",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to remove from the cycle",
      },
    },
    required: ["project_id", "cycle_id", "issue_id"],
  },
};

// Label Management Tools
const LIST_LABELS_TOOL: Tool = {
  name: "list-labels",
  description: "List all labels in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get labels from",
      },
    },
    required: ["project_id"],
  },
};

const GET_LABEL_TOOL: Tool = {
  name: "get-label",
  description: "Get detailed information about a specific label",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the label",
      },
      label_id: {
        type: "string",
        description: "ID of the label to retrieve",
      },
    },
    required: ["project_id", "label_id"],
  },
};

const CREATE_LABEL_TOOL: Tool = {
  name: "create-label",
  description: "Create a new label in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project where the label should be created",
      },
      name: {
        type: "string",
        description: "Name of the label",
      },
      description: {
        type: "string",
        description: "Description of the label (optional)",
      },
      color: {
        type: "string",
        description: "Color code for the label (optional, e.g., #ff0000)",
      },
    },
    required: ["project_id", "name"],
  },
};

const UPDATE_LABEL_TOOL: Tool = {
  name: "update-label",
  description: "Update an existing label in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the label",
      },
      label_id: {
        type: "string",
        description: "ID of the label to update",
      },
      name: {
        type: "string",
        description: "Updated name of the label (optional)",
      },
      description: {
        type: "string",
        description: "Updated description of the label (optional)",
      },
      color: {
        type: "string",
        description: "Updated color code for the label (optional)",
      },
    },
    required: ["project_id", "label_id"],
  },
};

const DELETE_LABEL_TOOL: Tool = {
  name: "delete-label",
  description: "Delete a label from a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the label",
      },
      label_id: {
        type: "string",
        description: "ID of the label to delete",
      },
    },
    required: ["project_id", "label_id"],
  },
};

// Members and Workspace Management Tools
const LIST_WORKSPACE_MEMBERS_TOOL: Tool = {
  name: "list-workspace-members",
  description: "List all members in the workspace",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

const LIST_PROJECT_MEMBERS_TOOL: Tool = {
  name: "list-project-members",
  description: "List all members in a specific project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get members from",
      },
    },
    required: ["project_id"],
  },
};

// Issue Comments Tools
const LIST_ISSUE_COMMENTS_TOOL: Tool = {
  name: "list-issue-comments",
  description: "List all comments on a specific issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to get comments from",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

const GET_ISSUE_COMMENT_TOOL: Tool = {
  name: "get-issue-comment",
  description: "Get detailed information about a specific comment",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the comment",
      },
      comment_id: {
        type: "string",
        description: "ID of the comment to retrieve",
      },
    },
    required: ["project_id", "issue_id", "comment_id"],
  },
};

const CREATE_ISSUE_COMMENT_TOOL: Tool = {
  name: "create-issue-comment",
  description: "Create a new comment on an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to comment on",
      },
      comment: {
        type: "string",
        description: "The comment text",
      },
    },
    required: ["project_id", "issue_id", "comment"],
  },
};

const UPDATE_ISSUE_COMMENT_TOOL: Tool = {
  name: "update-issue-comment",
  description: "Update an existing comment on an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the comment",
      },
      comment_id: {
        type: "string",
        description: "ID of the comment to update",
      },
      comment: {
        type: "string",
        description: "The updated comment text",
      },
    },
    required: ["project_id", "issue_id", "comment_id", "comment"],
  },
};

const DELETE_ISSUE_COMMENT_TOOL: Tool = {
  name: "delete-issue-comment",
  description: "Delete a comment from an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the comment",
      },
      comment_id: {
        type: "string",
        description: "ID of the comment to delete",
      },
    },
    required: ["project_id", "issue_id", "comment_id"],
  },
};

// Issue Links Tools
const LIST_ISSUE_LINKS_TOOL: Tool = {
  name: "list-issue-links",
  description: "List all external links attached to an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to get links from",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

const GET_ISSUE_LINK_TOOL: Tool = {
  name: "get-issue-link",
  description: "Get detailed information about a specific issue link",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the link",
      },
      link_id: {
        type: "string",
        description: "ID of the link to retrieve",
      },
    },
    required: ["project_id", "issue_id", "link_id"],
  },
};

const CREATE_ISSUE_LINK_TOOL: Tool = {
  name: "create-issue-link",
  description: "Create a new external link for an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to add link to",
      },
      title: {
        type: "string",
        description: "Title/name for the link",
      },
      url: {
        type: "string",
        description: "The URL to link to",
      },
    },
    required: ["project_id", "issue_id", "title", "url"],
  },
};

const UPDATE_ISSUE_LINK_TOOL: Tool = {
  name: "update-issue-link",
  description: "Update an existing issue link",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the link",
      },
      link_id: {
        type: "string",
        description: "ID of the link to update",
      },
      title: {
        type: "string",
        description: "Updated title/name for the link (optional)",
      },
      url: {
        type: "string",
        description: "Updated URL (optional)",
      },
    },
    required: ["project_id", "issue_id", "link_id"],
  },
};

const DELETE_ISSUE_LINK_TOOL: Tool = {
  name: "delete-issue-link",
  description: "Delete an external link from an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the link",
      },
      link_id: {
        type: "string",
        description: "ID of the link to delete",
      },
    },
    required: ["project_id", "issue_id", "link_id"],
  },
};

// Issue Attachments Tools
const LIST_ISSUE_ATTACHMENTS_TOOL: Tool = {
  name: "list-issue-attachments",
  description: "List all file attachments for an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to get attachments from",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

const GET_ISSUE_ATTACHMENT_UPLOAD_URL_TOOL: Tool = {
  name: "get-issue-attachment-upload-url",
  description: "Get a pre-signed URL for uploading file attachments to an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to attach file to",
      },
      file_name: {
        type: "string",
        description: "Name of the file to upload",
      },
      file_size: {
        type: "number",
        description: "Size of the file in bytes",
      },
      content_type: {
        type: "string",
        description: "MIME type of the file (e.g., 'image/png', 'application/pdf')",
      },
    },
    required: ["project_id", "issue_id", "file_name", "file_size", "content_type"],
  },
};

// Issue Activities Tool
const LIST_ISSUE_ACTIVITIES_TOOL: Tool = {
  name: "list-issue-activities",
  description: "List all activities/history for an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to get activities from",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

const GET_ISSUE_ACTIVITY_TOOL: Tool = {
  name: "get-issue-activity",
  description: "Get detailed information about a specific issue activity",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the activity",
      },
      activity_id: {
        type: "string",
        description: "ID of the activity to retrieve",
      },
    },
    required: ["project_id", "issue_id", "activity_id"],
  },
};

// Worklogs Tools
const LIST_ISSUE_WORKLOGS_TOOL: Tool = {
  name: "list-issue-worklogs",
  description: "List all time logs for a specific issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to get worklogs from",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

const GET_PROJECT_TOTAL_WORKLOGS_TOOL: Tool = {
  name: "get-project-total-worklogs",
  description: "Get total time logged across all issues in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get total worklogs from",
      },
    },
    required: ["project_id"],
  },
};

const CREATE_ISSUE_WORKLOG_TOOL: Tool = {
  name: "create-issue-worklog",
  description: "Create a new time log entry for an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to log time for",
      },
      duration: {
        type: "number",
        description: "Time logged in hours (e.g., 2.5 for 2 hours 30 minutes)",
      },
      description: {
        type: "string",
        description: "Description of the work done (optional)",
      },
    },
    required: ["project_id", "issue_id", "duration"],
  },
};

const UPDATE_ISSUE_WORKLOG_TOOL: Tool = {
  name: "update-issue-worklog",
  description: "Update an existing worklog entry",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the worklog",
      },
      worklog_id: {
        type: "string",
        description: "ID of the worklog to update",
      },
      duration: {
        type: "number",
        description: "Updated time logged in hours (optional)",
      },
      description: {
        type: "string",
        description: "Updated description of the work done (optional)",
      },
    },
    required: ["project_id", "issue_id", "worklog_id"],
  },
};

const DELETE_ISSUE_WORKLOG_TOOL: Tool = {
  name: "delete-issue-worklog",
  description: "Delete a worklog entry from an issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue containing the worklog",
      },
      worklog_id: {
        type: "string",
        description: "ID of the worklog to delete",
      },
    },
    required: ["project_id", "issue_id", "worklog_id"],
  },
};

// Issue Types Tools
const LIST_ISSUE_TYPES_TOOL: Tool = {
  name: "list-issue-types",
  description: "List all custom issue types in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get issue types from",
      },
    },
    required: ["project_id"],
  },
};

const GET_ISSUE_TYPE_TOOL: Tool = {
  name: "get-issue-type",
  description: "Get detailed information about a specific issue type",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue type",
      },
      type_id: {
        type: "string",
        description: "ID of the issue type to retrieve",
      },
    },
    required: ["project_id", "type_id"],
  },
};

const CREATE_ISSUE_TYPE_TOOL: Tool = {
  name: "create-issue-type",
  description: "Create a new custom issue type in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to create issue type in",
      },
      name: {
        type: "string",
        description: "Name of the issue type",
      },
      description: {
        type: "string",
        description: "Description of the issue type (optional)",
      },
    },
    required: ["project_id", "name"],
  },
};

const UPDATE_ISSUE_TYPE_TOOL: Tool = {
  name: "update-issue-type",
  description: "Update an existing issue type",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue type",
      },
      type_id: {
        type: "string",
        description: "ID of the issue type to update",
      },
      name: {
        type: "string",
        description: "Updated name of the issue type (optional)",
      },
      description: {
        type: "string",
        description: "Updated description (optional)",
      },
    },
    required: ["project_id", "type_id"],
  },
};

const DELETE_ISSUE_TYPE_TOOL: Tool = {
  name: "delete-issue-type",
  description: "Delete an issue type from a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the issue type",
      },
      type_id: {
        type: "string",
        description: "ID of the issue type to delete",
      },
    },
    required: ["project_id", "type_id"],
  },
};

// Intake Issues Tools
const LIST_INTAKE_ISSUES_TOOL: Tool = {
  name: "list-intake-issues",
  description: "List all intake/inbox issues in a project",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to get intake issues from",
      },
    },
    required: ["project_id"],
  },
};

const GET_INTAKE_ISSUE_TOOL: Tool = {
  name: "get-intake-issue",
  description: "Get detailed information about a specific intake issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the intake issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the intake issue to retrieve",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

const CREATE_INTAKE_ISSUE_TOOL: Tool = {
  name: "create-intake-issue",
  description: "Create a new intake/inbox issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project to create intake issue in",
      },
      name: {
        type: "string",
        description: "Title of the intake issue",
      },
      description_html: {
        type: "string",
        description: "HTML description of the issue (optional)",
      },
      priority: {
        type: "string",
        description: "Priority of the issue (urgent, high, medium, low, none)",
        enum: ["urgent", "high", "medium", "low", "none"],
      },
    },
    required: ["project_id", "name"],
  },
};

const UPDATE_INTAKE_ISSUE_TOOL: Tool = {
  name: "update-intake-issue",
  description: "Update an existing intake issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the intake issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the intake issue to update",
      },
      name: {
        type: "string",
        description: "Updated title (optional)",
      },
      description_html: {
        type: "string",
        description: "Updated HTML description (optional)",
      },
      priority: {
        type: "string",
        description: "Updated priority (optional)",
        enum: ["urgent", "high", "medium", "low", "none"],
      },
    },
    required: ["project_id", "issue_id"],
  },
};

const DELETE_INTAKE_ISSUE_TOOL: Tool = {
  name: "delete-intake-issue",
  description: "Delete an intake issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project containing the intake issue",
      },
      issue_id: {
        type: "string",
        description: "ID of the intake issue to delete",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

// Issue Property Management Tools
const LIST_ISSUE_PROPERTIES_TOOL: Tool = {
  name: "list-issue-properties",
  description: "List all custom properties for a specific issue type",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      type_id: {
        type: "string",
        description: "ID of the issue type to get properties for",
      },
    },
    required: ["project_id", "type_id"],
  },
};

const GET_ISSUE_PROPERTY_TOOL: Tool = {
  name: "get-issue-property",
  description: "Get details of a specific issue property",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      type_id: {
        type: "string",
        description: "ID of the issue type",
      },
      property_id: {
        type: "string",
        description: "ID of the property to retrieve",
      },
    },
    required: ["project_id", "type_id", "property_id"],
  },
};

const CREATE_ISSUE_PROPERTY_TOOL: Tool = {
  name: "create-issue-property",
  description: "Create a new custom property for an issue type",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      type_id: {
        type: "string",
        description: "ID of the issue type",
      },
      name: {
        type: "string",
        description: "Internal name for the property",
      },
      display_name: {
        type: "string",
        description: "Display name for the property",
      },
      description: {
        type: "string",
        description: "Description of the property",
      },
      property_type: {
        type: "string",
        description: "Type of property (TEXT, NUMBER, DATE, OPTION, etc.)",
        enum: ["TEXT", "NUMBER", "DATE", "OPTION", "MULTI_OPTION", "BOOLEAN"],
      },
      is_required: {
        type: "boolean",
        description: "Whether this property is required",
      },
      is_multi: {
        type: "boolean",
        description: "Whether multiple values are allowed (for OPTION type)",
      },
    },
    required: ["project_id", "type_id", "name", "display_name", "property_type"],
  },
};

const UPDATE_ISSUE_PROPERTY_TOOL: Tool = {
  name: "update-issue-property",
  description: "Update an existing issue property",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      type_id: {
        type: "string",
        description: "ID of the issue type",
      },
      property_id: {
        type: "string",
        description: "ID of the property to update",
      },
      name: {
        type: "string",
        description: "Internal name for the property",
      },
      display_name: {
        type: "string",
        description: "Display name for the property",
      },
      description: {
        type: "string",
        description: "Description of the property",
      },
      is_required: {
        type: "boolean",
        description: "Whether this property is required",
      },
      is_multi: {
        type: "boolean",
        description: "Whether multiple values are allowed",
      },
    },
    required: ["project_id", "type_id", "property_id"],
  },
};

const DELETE_ISSUE_PROPERTY_TOOL: Tool = {
  name: "delete-issue-property",
  description: "Delete an issue property",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      type_id: {
        type: "string",
        description: "ID of the issue type",
      },
      property_id: {
        type: "string",
        description: "ID of the property to delete",
      },
    },
    required: ["project_id", "type_id", "property_id"],
  },
};

const LIST_ISSUE_PROPERTY_OPTIONS_TOOL: Tool = {
  name: "list-issue-property-options",
  description: "List all options for a dropdown/select issue property",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      property_id: {
        type: "string",
        description: "ID of the property to get options for",
      },
    },
    required: ["project_id", "property_id"],
  },
};

const CREATE_ISSUE_PROPERTY_OPTION_TOOL: Tool = {
  name: "create-issue-property-option",
  description: "Create a new option for a dropdown/select issue property",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      property_id: {
        type: "string",
        description: "ID of the property to add option to",
      },
      name: {
        type: "string",
        description: "Name of the option",
      },
      description: {
        type: "string",
        description: "Description of the option",
      },
      sort_order: {
        type: "number",
        description: "Sort order for the option",
      },
      is_default: {
        type: "boolean",
        description: "Whether this is the default option",
      },
    },
    required: ["project_id", "property_id", "name"],
  },
};

const UPDATE_ISSUE_PROPERTY_OPTION_TOOL: Tool = {
  name: "update-issue-property-option",
  description: "Update an option for a dropdown/select issue property",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      property_id: {
        type: "string",
        description: "ID of the property",
      },
      option_id: {
        type: "string",
        description: "ID of the option to update",
      },
      name: {
        type: "string",
        description: "Name of the option",
      },
      description: {
        type: "string",
        description: "Description of the option",
      },
      sort_order: {
        type: "number",
        description: "Sort order for the option",
      },
      is_default: {
        type: "boolean",
        description: "Whether this is the default option",
      },
    },
    required: ["project_id", "property_id", "option_id"],
  },
};

// Sub-issues & Relations Tools
const LIST_SUB_ISSUES_TOOL: Tool = {
  name: "list-sub-issues",
  description: "List all sub-issues of a parent issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      parent_issue_id: {
        type: "string",
        description: "ID of the parent issue to get sub-issues for",
      },
    },
    required: ["project_id", "parent_issue_id"],
  },
};

const CREATE_SUB_ISSUE_TOOL: Tool = {
  name: "create-sub-issue",
  description: "Create a new sub-issue under a parent issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      parent_issue_id: {
        type: "string",
        description: "ID of the parent issue",
      },
      name: {
        type: "string",
        description: "Title of the sub-issue",
      },
      description_html: {
        type: "string",
        description: "HTML description of the sub-issue",
      },
      priority: {
        type: "string",
        description: "Priority of the sub-issue (urgent, high, medium, low, none)",
        enum: ["urgent", "high", "medium", "low", "none"],
      },
      state_id: {
        type: "string",
        description: "ID of the state for this sub-issue (optional)",
      },
      assignees: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of user IDs to assign to this sub-issue (optional)",
      },
    },
    required: ["project_id", "parent_issue_id", "name"],
  },
};

const CONVERT_TO_SUB_ISSUE_TOOL: Tool = {
  name: "convert-to-sub-issue",
  description: "Convert an existing issue to a sub-issue of another issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      issue_id: {
        type: "string",
        description: "ID of the issue to convert to sub-issue",
      },
      parent_issue_id: {
        type: "string",
        description: "ID of the parent issue",
      },
    },
    required: ["project_id", "issue_id", "parent_issue_id"],
  },
};

const CONVERT_TO_ISSUE_TOOL: Tool = {
  name: "convert-to-issue",
  description: "Convert a sub-issue back to a regular issue (remove parent relationship)",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      issue_id: {
        type: "string",
        description: "ID of the sub-issue to convert to regular issue",
      },
    },
    required: ["project_id", "issue_id"],
  },
};

// Issue Transfer Operations Tool
const TRANSFER_ISSUES_TOOL: Tool = {
  name: "transfer-issues",
  description: "Transfer issues from one cycle to another",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "ID of the project",
      },
      cycle_id: {
        type: "string",
        description: "ID of the source cycle to transfer issues from",
      },
      new_cycle_id: {
        type: "string",
        description: "ID of the target cycle to transfer issues to",
      },
    },
    required: ["project_id", "cycle_id", "new_cycle_id"],
  },
};

/**
 * Calls the Plane API with appropriate headers and error handling
 * @param endpoint - API endpoint to call (without base URL)
 * @param method - HTTP method (GET, POST, PATCH, DELETE)
 * @param body - Optional request body for POST/PATCH requests
 * @returns Response data from the API
 */
async function callPlaneAPI(
  endpoint: string,
  method: string,
  body?: any
): Promise<any> {
  const baseUrl = `https://api.plane.so/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}`;
  const url = `${baseUrl}${endpoint}`;

  // Debug logging for cycle and module operations
  if (endpoint.includes('/cycles/') && method === 'POST') {
    console.error(`DEBUG: Cycle creation URL: ${url}`);
    console.error(`DEBUG: Cycle creation body:`, JSON.stringify(body, null, 2));
  }
  if (endpoint.includes('/modules/')) {
    console.error(`DEBUG: Module operation URL: ${url}`);
    console.error(`DEBUG: Module operation method: ${method}`);
    if (body) console.error(`DEBUG: Module operation body:`, JSON.stringify(body, null, 2));
  }

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": PLANE_API_KEY as string,
    },
  };

  if (body && (method === "POST" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (parseError) {
        errorText = "Unable to parse error response";
      }
      throw new Error(
        `Plane API error: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    // For DELETE requests that return 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Error calling Plane API: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Initialize the server with tool metadata and capabilities
const server = new Server(
  {
    name: "plane-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // Project Management
    LIST_PROJECTS_TOOL,
    GET_PROJECT_TOOL,
    
    // Issue Management
    CREATE_ISSUE_TOOL,
    LIST_ISSUES_TOOL,
    GET_ISSUE_TOOL,
    UPDATE_ISSUE_TOOL,
    
    // State Management
    LIST_STATES_TOOL,
    GET_STATE_TOOL,
    CREATE_STATE_TOOL,
    UPDATE_STATE_TOOL,
    DELETE_STATE_TOOL,
    
    // Module (Sprint) Management
    LIST_MODULES_TOOL,
    GET_MODULE_TOOL,
    CREATE_MODULE_TOOL,
    UPDATE_MODULE_TOOL,
    DELETE_MODULE_TOOL,
    LIST_MODULE_ISSUES_TOOL,
    ADD_ISSUES_TO_MODULE_TOOL,
    REMOVE_ISSUE_FROM_MODULE_TOOL,
    
    // Cycle Management
    LIST_CYCLES_TOOL,
    GET_CYCLE_TOOL,
    CREATE_CYCLE_TOOL,
    UPDATE_CYCLE_TOOL,
    DELETE_CYCLE_TOOL,
    LIST_CYCLE_ISSUES_TOOL,
    ADD_ISSUES_TO_CYCLE_TOOL,
    REMOVE_ISSUE_FROM_CYCLE_TOOL,
    
    // Label Management
    LIST_LABELS_TOOL,
    GET_LABEL_TOOL,
    CREATE_LABEL_TOOL,
    UPDATE_LABEL_TOOL,
    DELETE_LABEL_TOOL,
    
    // Members and Workspace
    LIST_WORKSPACE_MEMBERS_TOOL,
    LIST_PROJECT_MEMBERS_TOOL,
    
    // Issue Comments
    LIST_ISSUE_COMMENTS_TOOL,
    GET_ISSUE_COMMENT_TOOL,
    CREATE_ISSUE_COMMENT_TOOL,
    UPDATE_ISSUE_COMMENT_TOOL,
    DELETE_ISSUE_COMMENT_TOOL,
    
    // Issue Links
    LIST_ISSUE_LINKS_TOOL,
    GET_ISSUE_LINK_TOOL,
    CREATE_ISSUE_LINK_TOOL,
    UPDATE_ISSUE_LINK_TOOL,
    DELETE_ISSUE_LINK_TOOL,
    
    // Issue Attachments
    LIST_ISSUE_ATTACHMENTS_TOOL,
    GET_ISSUE_ATTACHMENT_UPLOAD_URL_TOOL,
    
    // Issue Activities
    LIST_ISSUE_ACTIVITIES_TOOL,
    GET_ISSUE_ACTIVITY_TOOL,
    
    // Worklogs (Time Tracking)
    LIST_ISSUE_WORKLOGS_TOOL,
    GET_PROJECT_TOTAL_WORKLOGS_TOOL,
    CREATE_ISSUE_WORKLOG_TOOL,
    UPDATE_ISSUE_WORKLOG_TOOL,
    DELETE_ISSUE_WORKLOG_TOOL,
    
    // Issue Types
    LIST_ISSUE_TYPES_TOOL,
    GET_ISSUE_TYPE_TOOL,
    CREATE_ISSUE_TYPE_TOOL,
    UPDATE_ISSUE_TYPE_TOOL,
    DELETE_ISSUE_TYPE_TOOL,
    
    // Intake Issues
    LIST_INTAKE_ISSUES_TOOL,
    GET_INTAKE_ISSUE_TOOL,
    CREATE_INTAKE_ISSUE_TOOL,
    UPDATE_INTAKE_ISSUE_TOOL,
    DELETE_INTAKE_ISSUE_TOOL,
    
    // Issue Property Management
    LIST_ISSUE_PROPERTIES_TOOL,
    GET_ISSUE_PROPERTY_TOOL,
    CREATE_ISSUE_PROPERTY_TOOL,
    UPDATE_ISSUE_PROPERTY_TOOL,
    DELETE_ISSUE_PROPERTY_TOOL,
    LIST_ISSUE_PROPERTY_OPTIONS_TOOL,
    CREATE_ISSUE_PROPERTY_OPTION_TOOL,
    UPDATE_ISSUE_PROPERTY_OPTION_TOOL,
    
    // Sub-issues & Relations
    LIST_SUB_ISSUES_TOOL,
    CREATE_SUB_ISSUE_TOOL,
    CONVERT_TO_SUB_ISSUE_TOOL,
    CONVERT_TO_ISSUE_TOOL,
    
    // Issue Transfer Operations
    TRANSFER_ISSUES_TOOL,
  ],
}));

// Register handler for calling tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    let { name, arguments: args = {} } = request.params;

    // Normalize tool name to handle both hyphen and underscore formats
    const normalizedName = name.replace(/_/g, "-");
    name = normalizedName;

    switch (name) {
      case "list-projects": {
        const projects = await callPlaneAPI("/projects/", "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
          isError: false,
        };
      }

      case "get-project": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const project = await callPlaneAPI(`/projects/${project_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
          isError: false,
        };
      }

      case "create-issue": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id, ...issueData } = args;

        // Ensure assignees is properly formatted as an array
        if (issueData.assignees) {
          // Special case: detect if entire issue is nested in assignees
          if (
            typeof issueData.assignees === "object" &&
            !Array.isArray(issueData.assignees) &&
            (issueData.assignees as Record<string, any>).project_id &&
            (issueData.assignees as Record<string, any>).name
          ) {
            // Issue is nested inside assignees, remove it completely
            delete issueData.assignees;
          } else if (!Array.isArray(issueData.assignees)) {
            if (typeof issueData.assignees === "string") {
              // Convert single string to array
              issueData.assignees = [issueData.assignees];
            } else if (typeof issueData.assignees === "object") {
              // Convert object to array of values
              issueData.assignees = Object.values(issueData.assignees);
            } else {
              // Remove invalid assignees
              delete issueData.assignees;
            }
          }
        }

        const issue = await callPlaneAPI(
          `/projects/${project_id}/issues/`,
          "POST",
          issueData
        );
        return {
          content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
          isError: false,
        };
      }

      case "list-issues": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id, ...queryParams } = args;

        // Build query string from other parameters
        const queryString = Object.entries(queryParams)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join("&");

        const endpoint = `/projects/${project_id}/issues/${
          queryString ? `?${queryString}` : ""
        }`;
        const issues = await callPlaneAPI(endpoint, "GET");

        return {
          content: [{ type: "text", text: JSON.stringify(issues, null, 2) }],
          isError: false,
        };
      }

      case "get-issue": {
        if (
          !args ||
          typeof args.project_id !== "string" ||
          typeof args.issue_id !== "string"
        ) {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const issue = await callPlaneAPI(
          `/projects/${project_id}/issues/${issue_id}/`,
          "GET"
        );
        return {
          content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
          isError: false,
        };
      }

      case "update-issue": {
        if (
          !args ||
          typeof args.project_id !== "string" ||
          typeof args.issue_id !== "string"
        ) {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id, ...updateData } = args;

        // Ensure assignees is properly formatted as an array
        if (updateData.assignees) {
          // Special case: detect if entire issue is nested in assignees
          if (
            typeof updateData.assignees === "object" &&
            !Array.isArray(updateData.assignees) &&
            (updateData.assignees as Record<string, any>).project_id &&
            (updateData.assignees as Record<string, any>).name
          ) {
            // Issue is nested inside assignees, remove it completely
            delete updateData.assignees;
          } else if (!Array.isArray(updateData.assignees)) {
            if (typeof updateData.assignees === "string") {
              // Convert single string to array
              updateData.assignees = [updateData.assignees];
            } else if (typeof updateData.assignees === "object") {
              // Convert object to array of values
              updateData.assignees = Object.values(updateData.assignees);
            } else {
              // Remove invalid assignees
              delete updateData.assignees;
            }
          }
        }

        const updatedIssue = await callPlaneAPI(
          `/projects/${project_id}/issues/${issue_id}/`,
          "PATCH",
          updateData
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(updatedIssue, null, 2) },
          ],
          isError: false,
        };
      }

      // State Management Cases
      case "list-states": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const states = await callPlaneAPI(`/projects/${project_id}/states/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(states, null, 2) }],
          isError: false,
        };
      }

      case "get-state": {
        if (!args || typeof args.project_id !== "string" || typeof args.state_id !== "string") {
          throw new Error("Project ID and State ID are required");
        }
        const { project_id, state_id } = args;
        const state = await callPlaneAPI(`/projects/${project_id}/states/${state_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(state, null, 2) }],
          isError: false,
        };
      }

      case "create-state": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id, ...stateData } = args;
        const state = await callPlaneAPI(`/projects/${project_id}/states/`, "POST", stateData);
        return {
          content: [{ type: "text", text: JSON.stringify(state, null, 2) }],
          isError: false,
        };
      }

      case "update-state": {
        if (!args || typeof args.project_id !== "string" || typeof args.state_id !== "string") {
          throw new Error("Project ID and State ID are required");
        }
        const { project_id, state_id, ...updateData } = args;
        const updatedState = await callPlaneAPI(`/projects/${project_id}/states/${state_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedState, null, 2) }],
          isError: false,
        };
      }

      case "delete-state": {
        if (!args || typeof args.project_id !== "string" || typeof args.state_id !== "string") {
          throw new Error("Project ID and State ID are required");
        }
        const { project_id, state_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/states/${state_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Module Management Cases
      case "list-modules": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const modules = await callPlaneAPI(`/projects/${project_id}/modules/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(modules, null, 2) }],
          isError: false,
        };
      }

      case "get-module": {
        if (!args || typeof args.project_id !== "string" || typeof args.module_id !== "string") {
          throw new Error("Project ID and Module ID are required");
        }
        const { project_id, module_id } = args;
        const module = await callPlaneAPI(`/projects/${project_id}/modules/${module_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(module, null, 2) }],
          isError: false,
        };
      }

      case "create-module": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id, ...moduleData } = args;
        
        // Ensure members is properly formatted as an array
        if (moduleData.members && !Array.isArray(moduleData.members)) {
          if (typeof moduleData.members === "string") {
            moduleData.members = [moduleData.members];
          } else if (typeof moduleData.members === "object") {
            moduleData.members = Object.values(moduleData.members);
          } else {
            delete moduleData.members;
          }
        }
        
        const module = await callPlaneAPI(`/projects/${project_id}/modules/`, "POST", moduleData);
        return {
          content: [{ type: "text", text: JSON.stringify(module, null, 2) }],
          isError: false,
        };
      }

      case "update-module": {
        if (!args || typeof args.project_id !== "string" || typeof args.module_id !== "string") {
          throw new Error("Project ID and Module ID are required");
        }
        const { project_id, module_id, ...updateData } = args;
        
        // Ensure members is properly formatted as an array
        if (updateData.members && !Array.isArray(updateData.members)) {
          if (typeof updateData.members === "string") {
            updateData.members = [updateData.members];
          } else if (typeof updateData.members === "object") {
            updateData.members = Object.values(updateData.members);
          } else {
            delete updateData.members;
          }
        }
        
        const updatedModule = await callPlaneAPI(`/projects/${project_id}/modules/${module_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedModule, null, 2) }],
          isError: false,
        };
      }

      case "delete-module": {
        if (!args || typeof args.project_id !== "string" || typeof args.module_id !== "string") {
          throw new Error("Project ID and Module ID are required");
        }
        const { project_id, module_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/modules/${module_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      case "list-module-issues": {
        if (!args || typeof args.project_id !== "string" || typeof args.module_id !== "string") {
          throw new Error("Project ID and Module ID are required");
        }
        const { project_id, module_id } = args;
        const issues = await callPlaneAPI(`/projects/${project_id}/modules/${module_id}/module-issues/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(issues, null, 2) }],
          isError: false,
        };
      }

      case "add-issues-to-module": {
        if (!args || typeof args.project_id !== "string" || typeof args.module_id !== "string" || !Array.isArray(args.issues)) {
          throw new Error("Project ID, Module ID, and issues array are required");
        }
        const { project_id, module_id, issues } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/modules/${module_id}/module-issues/`, "POST", { issues });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      case "remove-issue-from-module": {
        if (!args || typeof args.project_id !== "string" || typeof args.module_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID, Module ID, and Issue ID are required");
        }
        const { project_id, module_id, issue_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/modules/${module_id}/module-issues/${issue_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Cycle Management Cases
      case "list-cycles": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const cycles = await callPlaneAPI(`/projects/${project_id}/cycles/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(cycles, null, 2) }],
          isError: false,
        };
      }

      case "get-cycle": {
        if (!args || typeof args.project_id !== "string" || typeof args.cycle_id !== "string") {
          throw new Error("Project ID and Cycle ID are required");
        }
        const { project_id, cycle_id } = args;
        const cycle = await callPlaneAPI(`/projects/${project_id}/cycles/${cycle_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(cycle, null, 2) }],
          isError: false,
        };
      }

      case "create-cycle": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id, ...cycleData } = args;
        // Include project_id in request body as some cycle APIs require it
        const requestBody = { ...cycleData, project: project_id };
        const cycle = await callPlaneAPI(`/projects/${project_id}/cycles/`, "POST", requestBody);
        return {
          content: [{ type: "text", text: JSON.stringify(cycle, null, 2) }],
          isError: false,
        };
      }

      case "update-cycle": {
        if (!args || typeof args.project_id !== "string" || typeof args.cycle_id !== "string") {
          throw new Error("Project ID and Cycle ID are required");
        }
        const { project_id, cycle_id, ...updateData } = args;
        const updatedCycle = await callPlaneAPI(`/projects/${project_id}/cycles/${cycle_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedCycle, null, 2) }],
          isError: false,
        };
      }

      case "delete-cycle": {
        if (!args || typeof args.project_id !== "string" || typeof args.cycle_id !== "string") {
          throw new Error("Project ID and Cycle ID are required");
        }
        const { project_id, cycle_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/cycles/${cycle_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      case "list-cycle-issues": {
        if (!args || typeof args.project_id !== "string" || typeof args.cycle_id !== "string") {
          throw new Error("Project ID and Cycle ID are required");
        }
        const { project_id, cycle_id } = args;
        const issues = await callPlaneAPI(`/projects/${project_id}/cycles/${cycle_id}/cycle-issues/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(issues, null, 2) }],
          isError: false,
        };
      }

      case "add-issues-to-cycle": {
        if (!args || typeof args.project_id !== "string" || typeof args.cycle_id !== "string" || !Array.isArray(args.issues)) {
          throw new Error("Project ID, Cycle ID, and issues array are required");
        }
        const { project_id, cycle_id, issues } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/cycles/${cycle_id}/cycle-issues/`, "POST", { issues });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      case "remove-issue-from-cycle": {
        if (!args || typeof args.project_id !== "string" || typeof args.cycle_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID, Cycle ID, and Issue ID are required");
        }
        const { project_id, cycle_id, issue_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/cycles/${cycle_id}/cycle-issues/${issue_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Label Management Cases
      case "list-labels": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const labels = await callPlaneAPI(`/projects/${project_id}/labels/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(labels, null, 2) }],
          isError: false,
        };
      }

      case "get-label": {
        if (!args || typeof args.project_id !== "string" || typeof args.label_id !== "string") {
          throw new Error("Project ID and Label ID are required");
        }
        const { project_id, label_id } = args;
        const label = await callPlaneAPI(`/projects/${project_id}/labels/${label_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(label, null, 2) }],
          isError: false,
        };
      }

      case "create-label": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id, ...labelData } = args;
        const label = await callPlaneAPI(`/projects/${project_id}/labels/`, "POST", labelData);
        return {
          content: [{ type: "text", text: JSON.stringify(label, null, 2) }],
          isError: false,
        };
      }

      case "update-label": {
        if (!args || typeof args.project_id !== "string" || typeof args.label_id !== "string") {
          throw new Error("Project ID and Label ID are required");
        }
        const { project_id, label_id, ...updateData } = args;
        const updatedLabel = await callPlaneAPI(`/projects/${project_id}/labels/${label_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedLabel, null, 2) }],
          isError: false,
        };
      }

      case "delete-label": {
        if (!args || typeof args.project_id !== "string" || typeof args.label_id !== "string") {
          throw new Error("Project ID and Label ID are required");
        }
        const { project_id, label_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/labels/${label_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Members and Workspace Management Cases
      case "list-workspace-members": {
        const members = await callPlaneAPI("/members/", "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(members, null, 2) }],
          isError: false,
        };
      }

      case "list-project-members": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const members = await callPlaneAPI(`/projects/${project_id}/members/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(members, null, 2) }],
          isError: false,
        };
      }

      // Issue Comments Cases
      case "list-issue-comments": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const comments = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/comments/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
          isError: false,
        };
      }

      case "get-issue-comment": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.comment_id !== "string") {
          throw new Error("Project ID, Issue ID, and Comment ID are required");
        }
        const { project_id, issue_id, comment_id } = args;
        const comment = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/comments/${comment_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(comment, null, 2) }],
          isError: false,
        };
      }

      case "create-issue-comment": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.comment !== "string") {
          throw new Error("Project ID, Issue ID, and comment text are required");
        }
        const { project_id, issue_id, comment } = args;
        const newComment = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/comments/`, "POST", { comment });
        return {
          content: [{ type: "text", text: JSON.stringify(newComment, null, 2) }],
          isError: false,
        };
      }

      case "update-issue-comment": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.comment_id !== "string" || typeof args.comment !== "string") {
          throw new Error("Project ID, Issue ID, Comment ID, and comment text are required");
        }
        const { project_id, issue_id, comment_id, comment } = args;
        const updatedComment = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/comments/${comment_id}/`, "PATCH", { comment });
        return {
          content: [{ type: "text", text: JSON.stringify(updatedComment, null, 2) }],
          isError: false,
        };
      }

      case "delete-issue-comment": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.comment_id !== "string") {
          throw new Error("Project ID, Issue ID, and Comment ID are required");
        }
        const { project_id, issue_id, comment_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/comments/${comment_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Issue Links Cases
      case "list-issue-links": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const links = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/links/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(links, null, 2) }],
          isError: false,
        };
      }

      case "get-issue-link": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.link_id !== "string") {
          throw new Error("Project ID, Issue ID, and Link ID are required");
        }
        const { project_id, issue_id, link_id } = args;
        const link = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/links/${link_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(link, null, 2) }],
          isError: false,
        };
      }

      case "create-issue-link": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.title !== "string" || typeof args.url !== "string") {
          throw new Error("Project ID, Issue ID, title, and URL are required");
        }
        const { project_id, issue_id, title, url } = args;
        const link = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/links/`, "POST", { title, url });
        return {
          content: [{ type: "text", text: JSON.stringify(link, null, 2) }],
          isError: false,
        };
      }

      case "update-issue-link": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.link_id !== "string") {
          throw new Error("Project ID, Issue ID, and Link ID are required");
        }
        const { project_id, issue_id, link_id, ...updateData } = args;
        const updatedLink = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/links/${link_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedLink, null, 2) }],
          isError: false,
        };
      }

      case "delete-issue-link": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.link_id !== "string") {
          throw new Error("Project ID, Issue ID, and Link ID are required");
        }
        const { project_id, issue_id, link_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/links/${link_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Issue Attachments Cases
      case "list-issue-attachments": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const attachments = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/issue-attachments/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(attachments, null, 2) }],
          isError: false,
        };
      }

      case "get-issue-attachment-upload-url": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.file_name !== "string" || typeof args.file_size !== "number" || typeof args.content_type !== "string") {
          throw new Error("Project ID, Issue ID, file_name, file_size, and content_type are required");
        }
        const { project_id, issue_id, file_name, file_size, content_type } = args;
        const uploadData = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/issue-attachments/`, "POST", {
          attributes: {
            name: file_name,
            size: file_size,
            type: content_type
          }
        });
        return {
          content: [{ type: "text", text: JSON.stringify(uploadData, null, 2) }],
          isError: false,
        };
      }

      // Issue Activities Cases
      case "list-issue-activities": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const activities = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/activities/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(activities, null, 2) }],
          isError: false,
        };
      }

      case "get-issue-activity": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.activity_id !== "string") {
          throw new Error("Project ID, Issue ID, and Activity ID are required");
        }
        const { project_id, issue_id, activity_id } = args;
        const activity = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/activities/${activity_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(activity, null, 2) }],
          isError: false,
        };
      }

      // Worklogs Cases
      case "list-issue-worklogs": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const worklogs = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/worklogs/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(worklogs, null, 2) }],
          isError: false,
        };
      }

      case "get-project-total-worklogs": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const totalWorklogs = await callPlaneAPI(`/projects/${project_id}/total-worklogs/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(totalWorklogs, null, 2) }],
          isError: false,
        };
      }

      case "create-issue-worklog": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.duration !== "number") {
          throw new Error("Project ID, Issue ID, and duration are required");
        }
        const { project_id, issue_id, duration, description } = args;
        const worklogData: any = { duration };
        if (description) worklogData.description = description;
        
        const worklog = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/worklogs/`, "POST", worklogData);
        return {
          content: [{ type: "text", text: JSON.stringify(worklog, null, 2) }],
          isError: false,
        };
      }

      case "update-issue-worklog": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.worklog_id !== "string") {
          throw new Error("Project ID, Issue ID, and Worklog ID are required");
        }
        const { project_id, issue_id, worklog_id, ...updateData } = args;
        const updatedWorklog = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/worklogs/${worklog_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedWorklog, null, 2) }],
          isError: false,
        };
      }

      case "delete-issue-worklog": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.worklog_id !== "string") {
          throw new Error("Project ID, Issue ID, and Worklog ID are required");
        }
        const { project_id, issue_id, worklog_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/worklogs/${worklog_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Issue Types Cases
      case "list-issue-types": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const issueTypes = await callPlaneAPI(`/projects/${project_id}/issue-types/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(issueTypes, null, 2) }],
          isError: false,
        };
      }

      case "get-issue-type": {
        if (!args || typeof args.project_id !== "string" || typeof args.type_id !== "string") {
          throw new Error("Project ID and Type ID are required");
        }
        const { project_id, type_id } = args;
        const issueType = await callPlaneAPI(`/projects/${project_id}/issue-types/${type_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(issueType, null, 2) }],
          isError: false,
        };
      }

      case "create-issue-type": {
        if (!args || typeof args.project_id !== "string" || typeof args.name !== "string") {
          throw new Error("Project ID and name are required");
        }
        const { project_id, ...typeData } = args;
        const issueType = await callPlaneAPI(`/projects/${project_id}/issue-types/`, "POST", typeData);
        return {
          content: [{ type: "text", text: JSON.stringify(issueType, null, 2) }],
          isError: false,
        };
      }

      case "update-issue-type": {
        if (!args || typeof args.project_id !== "string" || typeof args.type_id !== "string") {
          throw new Error("Project ID and Type ID are required");
        }
        const { project_id, type_id, ...updateData } = args;
        const updatedIssueType = await callPlaneAPI(`/projects/${project_id}/issue-types/${type_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedIssueType, null, 2) }],
          isError: false,
        };
      }

      case "delete-issue-type": {
        if (!args || typeof args.project_id !== "string" || typeof args.type_id !== "string") {
          throw new Error("Project ID and Type ID are required");
        }
        const { project_id, type_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/issue-types/${type_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Intake Issues Cases
      case "list-intake-issues": {
        if (!args || typeof args.project_id !== "string") {
          throw new Error("Project ID is required");
        }
        const { project_id } = args;
        const intakeIssues = await callPlaneAPI(`/projects/${project_id}/intake-issues/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(intakeIssues, null, 2) }],
          isError: false,
        };
      }

      case "get-intake-issue": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const intakeIssue = await callPlaneAPI(`/projects/${project_id}/intake-issues/${issue_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(intakeIssue, null, 2) }],
          isError: false,
        };
      }

      case "create-intake-issue": {
        if (!args || typeof args.project_id !== "string" || typeof args.name !== "string") {
          throw new Error("Project ID and name are required");
        }
        const { project_id, ...issueData } = args;
        const intakeIssue = await callPlaneAPI(`/projects/${project_id}/intake-issues/`, "POST", issueData);
        return {
          content: [{ type: "text", text: JSON.stringify(intakeIssue, null, 2) }],
          isError: false,
        };
      }

      case "update-intake-issue": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id, ...updateData } = args;
        const updatedIntakeIssue = await callPlaneAPI(`/projects/${project_id}/intake-issues/${issue_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedIntakeIssue, null, 2) }],
          isError: false,
        };
      }

      case "delete-intake-issue": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/intake-issues/${issue_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      // Issue Property Management Cases
      case "list-issue-properties": {
        if (!args || typeof args.project_id !== "string" || typeof args.type_id !== "string") {
          throw new Error("Project ID and Type ID are required");
        }
        const { project_id, type_id } = args;
        const properties = await callPlaneAPI(`/projects/${project_id}/issue-types/${type_id}/issue-properties/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(properties, null, 2) }],
          isError: false,
        };
      }

      case "get-issue-property": {
        if (!args || typeof args.project_id !== "string" || typeof args.type_id !== "string" || typeof args.property_id !== "string") {
          throw new Error("Project ID, Type ID, and Property ID are required");
        }
        const { project_id, type_id, property_id } = args;
        const property = await callPlaneAPI(`/projects/${project_id}/issue-types/${type_id}/issue-properties/${property_id}/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(property, null, 2) }],
          isError: false,
        };
      }

      case "create-issue-property": {
        if (!args || typeof args.project_id !== "string" || typeof args.type_id !== "string") {
          throw new Error("Project ID and Type ID are required");
        }
        const { project_id, type_id, ...propertyData } = args;
        const property = await callPlaneAPI(`/projects/${project_id}/issue-types/${type_id}/issue-properties/`, "POST", propertyData);
        return {
          content: [{ type: "text", text: JSON.stringify(property, null, 2) }],
          isError: false,
        };
      }

      case "update-issue-property": {
        if (!args || typeof args.project_id !== "string" || typeof args.type_id !== "string" || typeof args.property_id !== "string") {
          throw new Error("Project ID, Type ID, and Property ID are required");
        }
        const { project_id, type_id, property_id, ...updateData } = args;
        const updatedProperty = await callPlaneAPI(`/projects/${project_id}/issue-types/${type_id}/issue-properties/${property_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedProperty, null, 2) }],
          isError: false,
        };
      }

      case "delete-issue-property": {
        if (!args || typeof args.project_id !== "string" || typeof args.type_id !== "string" || typeof args.property_id !== "string") {
          throw new Error("Project ID, Type ID, and Property ID are required");
        }
        const { project_id, type_id, property_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/issue-types/${type_id}/issue-properties/${property_id}/`, "DELETE");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      case "list-issue-property-options": {
        if (!args || typeof args.project_id !== "string" || typeof args.property_id !== "string") {
          throw new Error("Project ID and Property ID are required");
        }
        const { project_id, property_id } = args;
        const options = await callPlaneAPI(`/projects/${project_id}/issue-properties/${property_id}/options/`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(options, null, 2) }],
          isError: false,
        };
      }

      case "create-issue-property-option": {
        if (!args || typeof args.project_id !== "string" || typeof args.property_id !== "string") {
          throw new Error("Project ID and Property ID are required");
        }
        const { project_id, property_id, ...optionData } = args;
        const option = await callPlaneAPI(`/projects/${project_id}/issue-properties/${property_id}/options/`, "POST", optionData);
        return {
          content: [{ type: "text", text: JSON.stringify(option, null, 2) }],
          isError: false,
        };
      }

      case "update-issue-property-option": {
        if (!args || typeof args.project_id !== "string" || typeof args.property_id !== "string" || typeof args.option_id !== "string") {
          throw new Error("Project ID, Property ID, and Option ID are required");
        }
        const { project_id, property_id, option_id, ...updateData } = args;
        const updatedOption = await callPlaneAPI(`/projects/${project_id}/issue-properties/${property_id}/options/${option_id}/`, "PATCH", updateData);
        return {
          content: [{ type: "text", text: JSON.stringify(updatedOption, null, 2) }],
          isError: false,
        };
      }

      // Sub-issues & Relations Cases
      case "list-sub-issues": {
        if (!args || typeof args.project_id !== "string" || typeof args.parent_issue_id !== "string") {
          throw new Error("Project ID and Parent Issue ID are required");
        }
        const { project_id, parent_issue_id } = args;
        const issues = await callPlaneAPI(`/projects/${project_id}/issues/?parent=${parent_issue_id}`, "GET");
        return {
          content: [{ type: "text", text: JSON.stringify(issues, null, 2) }],
          isError: false,
        };
      }

      case "create-sub-issue": {
        if (!args || typeof args.project_id !== "string" || typeof args.parent_issue_id !== "string") {
          throw new Error("Project ID and Parent Issue ID are required");
        }
        const { project_id, parent_issue_id, ...issueData } = args;
        const subIssueData = {
          ...issueData,
          parent: parent_issue_id,
        };
        const subIssue = await callPlaneAPI(`/projects/${project_id}/issues/`, "POST", subIssueData);
        return {
          content: [{ type: "text", text: JSON.stringify(subIssue, null, 2) }],
          isError: false,
        };
      }

      case "convert-to-sub-issue": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string" || typeof args.parent_issue_id !== "string") {
          throw new Error("Project ID, Issue ID, and Parent Issue ID are required");
        }
        const { project_id, issue_id, parent_issue_id } = args;
        const updatedIssue = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/`, "PATCH", { parent: parent_issue_id });
        return {
          content: [{ type: "text", text: JSON.stringify(updatedIssue, null, 2) }],
          isError: false,
        };
      }

      case "convert-to-issue": {
        if (!args || typeof args.project_id !== "string" || typeof args.issue_id !== "string") {
          throw new Error("Project ID and Issue ID are required");
        }
        const { project_id, issue_id } = args;
        const updatedIssue = await callPlaneAPI(`/projects/${project_id}/issues/${issue_id}/`, "PATCH", { parent: null });
        return {
          content: [{ type: "text", text: JSON.stringify(updatedIssue, null, 2) }],
          isError: false,
        };
      }

      // Issue Transfer Operations Cases
      case "transfer-issues": {
        if (!args || typeof args.project_id !== "string" || typeof args.cycle_id !== "string" || typeof args.new_cycle_id !== "string") {
          throw new Error("Project ID, Cycle ID, and New Cycle ID are required");
        }
        const { project_id, cycle_id, new_cycle_id } = args;
        const result = await callPlaneAPI(`/projects/${project_id}/cycles/${cycle_id}/transfer-issues/`, "POST", { new_cycle_id });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Initializes and runs the MCP server using stdio for communication
 */
async function runServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Plane MCP Server running on stdio");
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

// Start the server
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
