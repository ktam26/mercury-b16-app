#!/usr/bin/env tsx
"use strict";
/**
 * Standalone server entry point for the MCP server.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const logger_1 = require("./logger");
const server_1 = require("./server");
const PORT = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : process.env.MCP_PORT
        ? parseInt(process.env.MCP_PORT, 10)
        : 3001;
const HOST = process.env.HOST || process.env.MCP_HOST || '0.0.0.0';
const PATH = process.env.MCP_PATH || '/mcp';
function getRequestPath(req) {
    try {
        const url = new URL(req.url ?? '', `http://${req.headers.host ?? 'localhost'}`);
        return url.pathname;
    }
    catch {
        return req.url ?? '';
    }
}
async function readJsonBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    if (chunks.length === 0) {
        return undefined;
    }
    const raw = Buffer.concat(chunks).toString('utf-8').trim();
    if (!raw) {
        return undefined;
    }
    return JSON.parse(raw);
}
async function main() {
    (0, logger_1.logServerEvent)('server_starting', { host: HOST, port: PORT, path: PATH });
    const mcpServer = (0, server_1.createMcpServer)();
    // Create transport once and connect MCP server to it
    const transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });
    await mcpServer.connect(transport);
    (0, logger_1.logServerEvent)('mcp_server_connected', {});
    // Create HTTP server that delegates to transport
    const httpServer = (0, node_http_1.createServer)(async (req, res) => {
        const pathname = getRequestPath(req);
        // Log all incoming requests for debugging
        (0, logger_1.logServerEvent)('http_request', {
            method: req.method,
            path: pathname,
            headers: req.headers,
        });
        // Set CORS headers for all requests
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, mcp-protocol-version');
        res.setHeader('Access-Control-Expose-Headers', 'mcp-protocol-version');
        res.setHeader('Access-Control-Max-Age', '86400');
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
        }
        // Only handle requests to the MCP path
        if (pathname !== PATH) {
            res.statusCode = 404;
            res.setHeader('content-type', 'text/plain');
            res.end('Not Found');
            return;
        }
        // Handle both GET and POST requests as per MCP spec
        if (req.method === 'GET') {
            // GET requests are used for SSE streams
            (0, logger_1.logServerEvent)('http_get_request', { path: pathname });
            try {
                await transport.handleRequest(Object.assign(req, { body: undefined }), res, undefined);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Internal server error';
                (0, logger_1.logServerEvent)('http_request_failed', { method: 'GET', message });
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.setHeader('content-type', 'application/json');
                    res.end(JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message,
                        },
                        id: null,
                    }));
                }
            }
            return;
        }
        if (req.method === 'POST') {
            // Parse request body for POST requests
            let parsedBody;
            try {
                parsedBody = await readJsonBody(req);
                (0, logger_1.logServerEvent)('http_post_request', { path: pathname, hasBody: parsedBody !== undefined });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Invalid request body';
                res.statusCode = 400;
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32600,
                        message,
                    },
                    id: null,
                }));
                return;
            }
            // Let transport handle the MCP request
            try {
                await transport.handleRequest(Object.assign(req, { body: parsedBody }), res, parsedBody);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Internal server error';
                (0, logger_1.logServerEvent)('http_request_failed', { method: 'POST', message });
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.setHeader('content-type', 'application/json');
                    res.end(JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message,
                        },
                        id: null,
                    }));
                }
            }
            return;
        }
        // Unsupported method
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, POST, OPTIONS');
        res.end('Method Not Allowed');
    });
    httpServer.listen(PORT, HOST, () => {
        (0, logger_1.logServerEvent)('server_started', { url: `http://${HOST}:${PORT}${PATH}` });
    });
    httpServer.on('error', (error) => {
        (0, logger_1.logServerEvent)('server_error', { error: error.message });
    });
    const shutdown = async (signal) => {
        (0, logger_1.logServerEvent)('server_stopping', { signal });
        httpServer.close();
        transport.close();
        await mcpServer.close();
        (0, logger_1.logServerEvent)('server_stopped', { signal });
        process.exit(0);
    };
    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
}
main().catch((error) => {
    (0, logger_1.logServerEvent)('server_start_failed', {
        error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
});
