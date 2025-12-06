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
const PLANE_HOST = process.env.PLANE_HOST || "https://api.plane.so";

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
    },
    required: ["project_id", "issue_id"],
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
  const baseUrl = `${PLANE_HOST}/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}`;
  const url = `${baseUrl}${endpoint}`;

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
    LIST_PROJECTS_TOOL,
    GET_PROJECT_TOOL,
    CREATE_ISSUE_TOOL,
    LIST_ISSUES_TOOL,
    GET_ISSUE_TOOL,
    UPDATE_ISSUE_TOOL,
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
