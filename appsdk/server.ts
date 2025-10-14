/**
 * Almaden Mercury B16 Apps SDK MCP server
 * Exposes team data via the Model Context Protocol.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import * as gameSerializer from './serializers/game-serializer';
import * as rosterSerializer from './serializers/roster-serializer';
import * as statsSerializer from './serializers/stats-serializer';
import { logResourceError, logToolInvocation } from './logger';

const SERVER_NAME = 'almaden-mercury-b16';
const SERVER_VERSION = '1.0.0';

// __dirname in compiled code is already appsdk/dist/, so widgets are in the same directory
const WIDGET_DIST_DIR = __dirname;

type WidgetId = 'next-match' | 'schedule' | 'roster' | 'player-stats';

interface WidgetConfig {
  uri: string;
  bundle: string;
  description: string;
  meta?: Record<string, unknown>;
}

const WIDGETS: Record<WidgetId, WidgetConfig> = {
  'next-match': {
    uri: 'ui://widget/next-match',
    bundle: 'next-match.js',
    description: 'Displays upcoming game information with countdown',
    meta: {
      'openai/widgetDescription': 'Upcoming match details with kickoff time, location, and kit reminders.',
    },
  },
  schedule: {
    uri: 'ui://widget/schedule',
    bundle: 'schedule.js',
    description: 'Displays team schedule with past results and upcoming fixtures',
    meta: {
      'openai/widgetDescription': 'Team schedule with outcomes and upcoming matches.',
    },
  },
  roster: {
    uri: 'ui://widget/roster',
    bundle: 'roster.js',
    description: 'Displays team roster and jersey numbers',
    meta: {
      'openai/widgetDescription': 'Full roster with jersey numbers and ages.',
    },
  },
  'player-stats': {
    uri: 'ui://widget/player-stats',
    bundle: 'player-stats.js',
    description: 'Displays player or team statistics overview',
    meta: {
      'openai/widgetDescription': 'Season stats highlights for a player or the full team.',
    },
  },
};

type ToolResult = CallToolResult;

const widgetHtmlCache = new Map<WidgetId, string>();

function loadWidgetHtml(widgetId: WidgetId): string {
  if (widgetHtmlCache.has(widgetId)) {
    return widgetHtmlCache.get(widgetId)!;
  }

  const config = WIDGETS[widgetId];
  const bundlePath = join(WIDGET_DIST_DIR, config.bundle);

  try {
    const widgetJs = readFileSync(bundlePath, 'utf-8');
    const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f9fafb; }
      * { box-sizing: border-box; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>${widgetJs}</script>
  </body>
</html>
    `.trim();

    widgetHtmlCache.set(widgetId, html);
    return html;
  } catch (error) {
    logResourceError(config.uri, error);
    throw error;
  }
}

async function handleToolInvocation(
  tool: string,
  args: unknown,
  executor: () => Promise<ToolResult> | ToolResult
): Promise<ToolResult> {
  const start = Date.now();

  try {
    const result = await executor();
    logToolInvocation({
      tool,
      args,
      durationMs: Date.now() - start,
      success: true,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logToolInvocation({
      tool,
      args,
      durationMs: Date.now() - start,
      success: false,
      error: message,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${tool}: ${message}`,
        },
      ],
      isError: true,
    };
  }
}

function toToolResult(serialized: { content: string; structuredContent?: unknown }): ToolResult {
  const payload: ToolResult = {
    content: [
      {
        type: 'text',
        text: serialized.content,
      },
    ],
  };

  if (serialized.structuredContent && typeof serialized.structuredContent === 'object') {
    payload.structuredContent = serialized.structuredContent as Record<string, unknown>;
  }

  return payload;
}

export function createMcpServer() {
  const server = new McpServer(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        resources: { listChanged: true },
        tools: { listChanged: true },
      },
    }
  );

  // Tools
  server.registerTool(
    'get_next_match',
    {
      title: 'Show next match',
      description: 'Get information about the next upcoming game, including opponent, kickoff time, and location details.',
      _meta: {
        'openai/outputTemplate': WIDGETS['next-match'].uri,
      },
    },
    async (args) =>
      handleToolInvocation('get_next_match', args, async () => {
        const nextGame = gameSerializer.getNextGame();

        if (!nextGame) {
          return toToolResult({ content: 'No upcoming games scheduled.' });
        }

        const result = gameSerializer.serializeNextMatch(nextGame);
        return toToolResult(result);
      })
  );

  server.registerTool(
    'list_schedule',
    {
      title: 'List schedule',
      description: 'Get the team schedule with past results and upcoming games.',
      inputSchema: {
        includePast: z.boolean().describe('Include past games in the response (default: true)').optional(),
        limit: z
          .number()
          .int()
          .positive()
          .max(20)
          .describe('Maximum number of upcoming games to return (default: 10)')
          .optional(),
      },
      _meta: {
        'openai/outputTemplate': WIDGETS['schedule'].uri,
      },
    } as any,
    async (args) =>
      handleToolInvocation('list_schedule', args, async () => {
        const includePast = args.includePast ?? true;
        const limit = args.limit ?? 10;

        const result = gameSerializer.serializeSchedule({
          includePast,
          upcomingLimit: limit,
          pastLimit: Math.max(5, limit),
        });

        return toToolResult(result);
      })
  );

  server.registerTool(
    'get_roster',
    {
      title: 'Get team roster',
      description: 'Retrieve the current team roster with jersey numbers.',
      _meta: {
        'openai/outputTemplate': WIDGETS['roster'].uri,
      },
    },
    async (args) =>
      handleToolInvocation('get_roster', args, async () => {
        const result = rosterSerializer.serializeRoster();
        return toToolResult(result);
      })
  );

  server.registerTool(
    'get_player_stats',
    {
      title: 'Get player stats',
      description: 'Return season statistics for a specific player or an overall team summary.',
      inputSchema: {
        playerId: z
          .string()
          .describe('Player ID (e.g., "player-045"). If omitted, returns team stats overview.')
          .optional(),
      },
      _meta: {
        'openai/outputTemplate': WIDGETS['player-stats'].uri,
      },
    } as any,
    async (args) =>
      handleToolInvocation('get_player_stats', args, async () => {
        const result = args.playerId
          ? statsSerializer.serializePlayerStats(args.playerId)
          : statsSerializer.serializeTeamStats();

        return toToolResult(result);
      })
  );

  // Resources
  (Object.entries(WIDGETS) as Array<[WidgetId, WidgetConfig]>).forEach(([widgetId, config]) => {
    server.registerResource(
      `${widgetId}-resource`,
      config.uri,
      {
        description: config.description,
        mimeType: 'text/html+skybridge',
        _meta: config.meta,
      },
      async () => {
        const html = loadWidgetHtml(widgetId);
        return {
          contents: [
            {
              uri: config.uri,
              mimeType: 'text/html+skybridge',
              text: html,
            },
          ],
        };
      }
    );
  });

  return server;
}
