"use strict";
/**
 * Almaden Mercury B16 Apps SDK MCP server
 * Exposes team data via the Model Context Protocol.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMcpServer = createMcpServer;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const gameSerializer = __importStar(require("./serializers/game-serializer"));
const rosterSerializer = __importStar(require("./serializers/roster-serializer"));
const statsSerializer = __importStar(require("./serializers/stats-serializer"));
const logger_1 = require("./logger");
const SERVER_NAME = 'almaden-mercury-b16';
const SERVER_VERSION = '1.0.0';
// __dirname in compiled code is already appsdk/dist/, so widgets are in the same directory
const WIDGET_DIST_DIR = __dirname;
const WIDGETS = {
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
const widgetHtmlCache = new Map();
function loadWidgetHtml(widgetId) {
    if (widgetHtmlCache.has(widgetId)) {
        return widgetHtmlCache.get(widgetId);
    }
    const config = WIDGETS[widgetId];
    const bundlePath = (0, node_path_1.join)(WIDGET_DIST_DIR, config.bundle);
    try {
        const widgetJs = (0, node_fs_1.readFileSync)(bundlePath, 'utf-8');
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
    }
    catch (error) {
        (0, logger_1.logResourceError)(config.uri, error);
        throw error;
    }
}
async function handleToolInvocation(tool, args, executor) {
    const start = Date.now();
    try {
        const result = await executor();
        (0, logger_1.logToolInvocation)({
            tool,
            args,
            durationMs: Date.now() - start,
            success: true,
        });
        return result;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        (0, logger_1.logToolInvocation)({
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
function toToolResult(serialized) {
    const payload = {
        content: [
            {
                type: 'text',
                text: serialized.content,
            },
        ],
    };
    if (serialized.structuredContent && typeof serialized.structuredContent === 'object') {
        payload.structuredContent = serialized.structuredContent;
    }
    return payload;
}
function createMcpServer() {
    const server = new mcp_js_1.McpServer({
        name: SERVER_NAME,
        version: SERVER_VERSION,
    }, {
        capabilities: {
            resources: { listChanged: true },
            tools: { listChanged: true },
        },
    });
    // Tools
    server.registerTool('get_next_match', {
        title: 'Show next match',
        description: 'Get information about the next upcoming game, including opponent, kickoff time, and location details.',
        _meta: {
            'openai/outputTemplate': WIDGETS['next-match'].uri,
        },
    }, async (args) => handleToolInvocation('get_next_match', args, async () => {
        const nextGame = gameSerializer.getNextGame();
        if (!nextGame) {
            return toToolResult({ content: 'No upcoming games scheduled.' });
        }
        const result = gameSerializer.serializeNextMatch(nextGame);
        return toToolResult(result);
    }));
    server.registerTool('list_schedule', {
        title: 'List schedule',
        description: 'Get the team schedule with past results and upcoming games.',
        inputSchema: {
            type: 'object',
            properties: {
                includePast: {
                    type: 'boolean',
                    description: 'Include past games in the response (default: true)'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of upcoming games to return (default: 10)',
                    minimum: 1,
                    maximum: 20
                }
            }
        },
        _meta: {
            'openai/outputTemplate': WIDGETS['schedule'].uri,
        },
    }, async (args) => handleToolInvocation('list_schedule', args, async () => {
        const includePast = args.includePast ?? true;
        const limit = args.limit ?? 10;
        const result = gameSerializer.serializeSchedule({
            includePast,
            upcomingLimit: limit,
            pastLimit: Math.max(5, limit),
        });
        return toToolResult(result);
    }));
    server.registerTool('get_roster', {
        title: 'Get team roster',
        description: 'Retrieve the current team roster with jersey numbers.',
        _meta: {
            'openai/outputTemplate': WIDGETS['roster'].uri,
        },
    }, async (args) => handleToolInvocation('get_roster', args, async () => {
        const result = rosterSerializer.serializeRoster();
        return toToolResult(result);
    }));
    server.registerTool('get_player_stats', {
        title: 'Get player stats',
        description: 'Return season statistics for a specific player or an overall team summary.',
        inputSchema: {
            type: 'object',
            properties: {
                playerId: {
                    type: 'string',
                    description: 'Player ID (e.g., "player-045"). If omitted, returns team stats overview.'
                }
            }
        },
        _meta: {
            'openai/outputTemplate': WIDGETS['player-stats'].uri,
        },
    }, async (args) => handleToolInvocation('get_player_stats', args, async () => {
        const result = args.playerId
            ? statsSerializer.serializePlayerStats(args.playerId)
            : statsSerializer.serializeTeamStats();
        return toToolResult(result);
    }));
    // Resources
    Object.entries(WIDGETS).forEach(([widgetId, config]) => {
        server.registerResource(`${widgetId}-resource`, config.uri, {
            description: config.description,
            mimeType: 'text/html+skybridge',
            _meta: config.meta,
        }, async () => {
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
        });
    });
    return server;
}
