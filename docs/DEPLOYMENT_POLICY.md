# Production deployment policy

Recorded: 2026-08-25

Shipyard production deployments must always be served at:

**https://genshipyard.com**

The generated `*.vercel.app` URL is only a deployment inspection URL. It is
not the canonical production destination. Before deploying, `npm run deploy`
requires a clean `main` branch synchronized with `origin/main` and reports the
canonical destination in its predeploy check.
