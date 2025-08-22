[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/kelvin6365-plane-mcp-server-badge.png)](https://mseep.ai/app/kelvin6365-plane-mcp-server)

# Plane MCP Server

[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/kelvin6365/plane-mcp-server)](https://archestra.ai/mcp-catalog/kelvin6365__plane-mcp-server)
[![smithery badge](https://smithery.ai/badge/@kelvin6365/plane-mcp-server)](https://smithery.ai/server/@kelvin6365/plane-mcp-server)

[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/kelvin6365-plane-mcp-server-badge.png)](https://mseep.ai/app/kelvin6365-plane-mcp-server)

A Model Context Protocol (MCP) server that enables LLMs to interact with [Plane.so](https://plane.so), allowing them to manage projects and issues through Plane's API. Using this server, LLMs like Claude can directly interact with your project management workflows while maintaining user control and security.

<a href="https://glama.ai/mcp/servers/@kelvin6365/plane-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@kelvin6365/plane-mcp-server/badge" />
</a>

## Features

- List all projects in your Plane workspace
- Get detailed information about specific projects
- Create new issues with customizable properties
- List and filter issues from projects
- Get detailed information about specific issues
- Update existing issues with new information

## Prerequisites

- Node.js 22.x or higher
- A Plane.so API key
- A Plane.so workspace

## Installation

### Option 1: Using Smithery

The quickest way to get started is to use Smithery to install the server directly:

```bash
# Install to Claude for Desktop
npx -y @smithery/cli install @kelvin6365/plane-mcp-server --client claude
```

This command will automatically set up the Plane MCP Server for use with Claude. After installation, you'll need to configure the server with your Plane API key and workspace slug through the Claude settings.

Valid client options are: claude, cline, windsurf, roo-cline, witsy, enconvo, cursor

Example for installing with Cursor:

```bash
npx -y @smithery/cli install @kelvin6365/plane-mcp-server --client cursor
```

### Option 2: Manual Setup

If you prefer to set up the server manually, follow these steps:

1. Clone this repository:

```bash
git clone https://github.com/kelvin6365/plane-mcp-server.git
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

## Usage with Claude for Desktop

> **Note:** If you used Option 1 (Smithery) above, you can skip this section. Smithery automatically configures the MCP server for you.

1. Open your Claude for Desktop configuration file:

   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the Plane MCP server configuration:

```json
{
  "mcpServers": {
    "plane": {
      "command": "node",
      "args": ["path/to/plane-mcp-server/build/index.js"],
      "env": {
        "PLANE_API_KEY": "your_plane_api_key_here",
        "PLANE_WORKSPACE_SLUG": "your_workspace_slug_here"
      }
    }
  }
}
```

3. Restart Claude for Desktop

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

> **Note:** The `assignees` parameter must be an array of user ID strings. Common errors include providing a dictionary/object instead of an array, or accidentally nesting the entire issue data inside the assignees field. The server will attempt to handle these cases, but it's best to use the correct format.

Example:

```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "name": "Implement new feature",
  "description_html": "<p>We need to implement the new reporting feature</p>",
  "priority": "high",
  "assignees": ["user-id-1", "user-id-2"]
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

> **Note:** The `assignees` parameter must be an array of user ID strings, following the same format guidelines as the create-issue tool.

Example:

```json
{
  "project_id": "01abc123-4567-89de-0123-456789abcdef",
  "issue_id": "01def456-7890-12gh-3456-789ijklmnopq",
  "priority": "urgent",
  "description_html": "<p>Updated description with <strong>more details</strong></p>"
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

1. "Can you list all the projects in my Plane workspace?"
2. "Please create a new high-priority issue in the Marketing project titled 'Update social media strategy'"
3. "What are all the high-priority issues in the Development project?"
4. "Update issue #123 in the QA project to change its priority to urgent"

Claude will use the appropriate tools to interact with Plane while asking for your approval before creating or modifying any issues.

## Security Considerations

- The API key requires proper Plane permissions to function
- All operations that modify data require explicit user approval
- Environment variables should be properly secured
- API keys should never be committed to version control

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the GitHub Issues section
2. Consult the MCP documentation at [modelcontextprotocol.io](https://modelcontextprotocol.io)
3. Open a new issue with detailed reproduction steps

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=kelvin6365/plane-mcp-server&type=Date)](https://www.star-history.com/#kelvin6365/plane-mcp-server&Date)
