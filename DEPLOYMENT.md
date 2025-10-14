# Deployment Quick Reference

This repository contains **two applications** that deploy independently:

## 1. Next.js Web App (Existing)

**Deploy to**: Vercel
**What**: The main web application
**Status**: Already deployed, no changes needed

```bash
# Deploys automatically on push to main
# Or manually: vercel deploy
```

## 2. MCP Server (New)

**Deploy to**: Render
**What**: ChatGPT integration via Model Context Protocol
**Documentation**: [`docs/RENDER_DEPLOYMENT.md`](./docs/RENDER_DEPLOYMENT.md)

```bash
# Automatic deployment:
# Push to GitHub → Render auto-deploys!
git push origin main
```

---

## Architecture

```
mercury-b16-app/ (single git repo)
├── app/         → Vercel (existing)
├── appsdk/      → Render (new)
├── data/        → Shared by both
└── lib/         → Shared by both
```

## Files Created

- ✅ [`docs/RENDER_DEPLOYMENT.md`](./docs/RENDER_DEPLOYMENT.md) - **Render deployment guide** (recommended)
- ✅ [`docs/MCP_DEPLOYMENT_GUIDE.md`](./docs/MCP_DEPLOYMENT_GUIDE.md) - Fly.io guide (alternative)
- ✅ `render.yaml` - Render configuration
- ✅ `appsdk/Dockerfile` - Production build (optional for Render)
- ✅ `.dockerignore` - Build optimization

---

## For Developers

**To deploy the MCP server**, read the Render guide:

👉 **[`docs/RENDER_DEPLOYMENT.md`](./docs/RENDER_DEPLOYMENT.md)**

It covers:
- GitHub integration
- Automatic deployments
- Testing & verification
- Troubleshooting
- No CLI needed!

**Estimated time**: 20 minutes for first deployment

---

## Key Points

✅ **Web app is unaffected** - Continues to work exactly as before
✅ **Monorepo architecture** - Both apps share code via same repository
✅ **Independent deployments** - Each deploys to its own platform
✅ **Simple configuration** - 3 files, ready to deploy

---

**Need help?** See the [Render deployment guide](./docs/RENDER_DEPLOYMENT.md) or [Fly.io guide](./docs/MCP_DEPLOYMENT_GUIDE.md)
