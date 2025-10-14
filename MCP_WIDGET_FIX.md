# MCP Widget Loading Issue - Resolution

**Date:** October 14, 2025
**Status:** ✅ RESOLVED

## Problem

MCP widgets were not loading when the server was run in development mode (`npm run appsdk:dev`). The server would return errors when trying to fetch widget resources:

```
ENOENT: no such file or directory, open '.../appsdk/next-match.js'
```

## Root Cause

The issue was in `appsdk/server.ts` line 22. The code used `__dirname` to locate widget bundles:

```typescript
const WIDGET_DIST_DIR = __dirname;
```

This worked in **production** (when running compiled JS with `node appsdk/dist/server-entry.js`) because `__dirname` pointed to `appsdk/dist/`.

However, in **development** (when running with `tsx appsdk/server-entry.ts`), `__dirname` pointed to `appsdk/` (the source directory), not `appsdk/dist/` (where the widget bundles are built).

## Solution

Modified `appsdk/server.ts` to detect the environment and adjust the path accordingly:

```typescript
// In development (tsx): __dirname = appsdk/, widgets are in appsdk/dist/
// In production (node): __dirname = appsdk/dist/, widgets are in same directory
const WIDGET_DIST_DIR = __dirname.endsWith('/dist') || __dirname.endsWith('\\dist')
  ? __dirname
  : join(__dirname, 'dist');
```

## Changes Made

### File: `appsdk/server.ts`

**Line 18-25** - Updated widget distribution directory path resolution to work in both development and production environments.

## Verification

All 4 widgets now load successfully in both development and production:

- ✅ `ui://widget/next-match`
- ✅ `ui://widget/schedule`
- ✅ `ui://widget/roster`
- ✅ `ui://widget/player-stats`

### Test Commands

```bash
# Development
npm run appsdk:dev

# Production
npm run appsdk:build
npm run appsdk:start

# Test widget loading
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"resources/list","id":1}'
```

## Deployment

The fix has been compiled into `appsdk/dist/server.js`. To deploy to Render:

1. Commit the changes:
   ```bash
   git add appsdk/server.ts appsdk/dist/
   git commit -m "Fix: Widget loading in development mode"
   git push
   ```

2. Render will automatically rebuild and deploy the updated code.

3. Verify widgets load on the remote server:
   ```bash
   curl -X POST https://mercury-b16-app.onrender.com/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{"jsonrpc":"2.0","method":"resources/list","id":1}'
   ```

## Next Steps

1. ✅ Fix has been applied and tested locally
2. **TODO:** Commit and push changes to trigger Render deployment
3. **TODO:** Verify widgets load correctly on production server
4. **TODO:** Test widgets in your MCP client (Claude Desktop/Inspector)

## Notes

- Widget bundles are built to `appsdk/dist/` directory
- The fix ensures path resolution works correctly in both `tsx` (development) and `node` (production) environments
- No changes needed to widget source files or build process
