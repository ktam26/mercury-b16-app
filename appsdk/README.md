# Almaden Mercury B16 Apps SDK Integration

This directory contains the MCP (Model Context Protocol) server integration for exposing team data to ChatGPT via the OpenAI Apps SDK.

## Architecture

```
appsdk/
├── server.ts              # MCP server implementation
├── server-entry.ts        # Standalone Node entry point
├── types.ts               # Shared TypeScript types
├── serializers/           # Data formatters
│   ├── game-serializer.ts
│   ├── roster-serializer.ts
│   └── stats-serializer.ts
├── widgets/               # React components
│   ├── next-match/
│   ├── schedule/
│   ├── roster/
│   └── player-stats/
└── dist/                  # Compiled output
```

## Tools

The MCP server exposes four tools:

1. **get_next_match** - Returns the next upcoming game with countdown
2. **list_schedule** - Returns team schedule with past/future games
3. **get_roster** - Returns complete team roster
4. **get_player_stats** - Returns player or team statistics

## Development

### Build

```bash
# Build server TypeScript files
npm run appsdk:build:server

# Build React widgets
npm run appsdk:build:widgets

# Build everything
npm run appsdk:build
```

### Run Locally

```bash
# Development mode (with auto-reload)
npm run appsdk:dev

# Production mode
npm run appsdk:start
```

The server will run at `http://localhost:3001/mcp` by default.

### Testing with ngrok

For local testing with ChatGPT:

```bash
# Install ngrok if needed
brew install ngrok  # macOS
# or download from ngrok.com

# Expose local server
ngrok http 3001

# Use the ngrok URL in ChatGPT app configuration
# Example: https://abc123.ngrok.io/mcp
```

### Environment Variables

Copy `.env.appsdk.example` to `.env.appsdk` and configure:

```bash
# Platforms like Fly.io set PORT/HOST automatically
PORT=3001
HOST=0.0.0.0

# Legacy variables remain supported for local tooling
MCP_PORT=3001
MCP_HOST=0.0.0.0

NODE_ENV=development
```

## Deployment

### Option 1: Fly.io

```bash
# Install Fly CLI
brew install flyctl

# Login
flyctl auth login

# Create app
flyctl apps create mercury-b16-mcp

# Deploy
flyctl deploy

# Set environment variables
flyctl secrets set NODE_ENV=production
```

### Option 2: Render

1. Create a new Web Service in Render dashboard
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run appsdk:build`
   - **Start Command**: `npm run appsdk:start`
   - **Environment**: Node
4. Add environment variables in Render dashboard

### Option 3: Vercel (with Next.js API Route)

Alternatively, you can deploy as a Next.js API route:

1. Create `app/api/mcp/route.ts`:
```typescript
export const runtime = 'nodejs';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/http.js';
import { createMcpServer } from '@/appsdk/server';

export async function POST(request: Request) {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    /* config */
  });
  await server.connect(transport);
  // Handle request
}
```

2. Deploy with `vercel`

## ChatGPT Integration

### App Configuration

In your ChatGPT app settings:

```json
{
  "name": "Almaden Mercury B16",
  "description": "Get team schedules, roster, and stats for Almaden Mercury B16",
  "mcp_endpoint": "https://your-domain.com/mcp",
  "icon": "https://your-domain.com/icon.png"
}
```

### Example Prompts

Once configured, users can ask:

- "When is the next game?"
- "Show me the team schedule"
- "Who's on the roster?"
- "What are the team stats?"
- "How is Tiago Pires performing?"

## Widgets

Widgets are React components that render inside ChatGPT. They use:

- `window.openai.toolOutput` - Access tool response data
- `window.openai.setWidgetState` - Manage component state
- Tailwind CSS classes - Styling

Widget bundles are created via esbuild and served as HTML resources.

## Data Updates

To update game results or roster:

1. Edit JSON files in `data/`
2. Rebuild and restart the server:
   ```bash
   npm run appsdk:build
   npm run appsdk:start
   ```

## Troubleshooting

### Server won't start

- Check that port 3001 is available
- Verify dependencies are installed: `npm install`
- Check that data files exist in `data/`

### Widgets not rendering

- Ensure widgets are built: `npm run appsdk:build:widgets`
- Check browser console for errors
- Verify widget URIs match in server.ts

### Tools not showing in ChatGPT

- Verify MCP endpoint is accessible
- Check ChatGPT app configuration
- Review server logs for errors

## Support

For issues or questions, see the main project README or contact the team.
