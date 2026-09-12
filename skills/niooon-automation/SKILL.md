---
name: niooon-automation
description: Automates GitHub repositories/workflows, Vercel deployments/projects, and Supabase database/functions using NIOOON Token Vault, niooon-manage-token, and @niooon/github.
---

# NIOOON Automation & Token Vault Skill

This skill provides complete operational knowledge, configuration, and code execution patterns for the **NIOOON Platform** (`https://nioon.lovable.app`).

## 1. Credentials & Configuration

- **Platform URL**: `https://nioon.lovable.app`
- **Vault Token Endpoint**: `https://nioon.lovable.app/api/public/vault/tokens`
- **Platform API Key**: `nio_live_f7b206cbaa68fc4b62a111c9791b2d631c776c338a1d46ea444449c8aca817af`
- **Environment Variable**: `NIOOON_PLATFORM_KEY` (saved in `/.env`)
- **Verified Connected Accounts**:
  - **GitHub**: `niooon-commits`
  - **Vercel**: `niooon-commits`
  - **Supabase**: Connected — Project `niooon.cc` (`rpagjdzvpaylxnqiddvb`), Region: `ap-southeast-1`, Status: `ACTIVE_HEALTHY`

## 2. Installed Packages

The project has both required packages installed:
- `@niooon/github`: Standalone TypeScript SDK and CLI (`niooon`) for GitHub, Vercel, and Supabase.
- `niooon-manage-token`: Token Vault client that fetches tokens dynamically into memory with 5-minute TTL.

## 3. How to Fetch Tokens & Initialize Clients

### Node.js / TypeScript Direct Execution:

```javascript
import { NiooonVault } from "niooon-manage-token";

const vault = new NiooonVault({
  apiKey: process.env.NIOOON_PLATFORM_KEY || "nio_live_f7b206cbaa68fc4b62a111c9791b2d631c776c338a1d46ea444449c8aca817af",
});

// Fetch token bundle (cached in memory for 300s)
const bundle = await vault.fetchBundle(["github", "vercel", "supabase"]);
// bundle.tokens.github -> "ghp_..."
// bundle.tokens.vercel -> "vcp_..."

// Using the bridge clients from @niooon/github:
const { NexusGitHub, NexusVercel, NexusSupabase } = require("@niooon/github");

// GitHub Client
const github = new NexusGitHub({ token: bundle.tokens.github });
const repos = await github.repos.list();

// Vercel Client
const vercel = new NexusVercel({ token: bundle.tokens.vercel });
const projects = await vercel.projects.list();
```

### Direct HTTP Vault Fetching (Fallback):

```javascript
const res = await fetch("https://nioon.lovable.app/api/public/vault/tokens", {
  method: "POST",
  headers: {
    authorization: `Bearer ${process.env.NIOOON_PLATFORM_KEY || "nio_live_f7b206cbaa68fc4b62a111c9791b2d631c776c338a1d46ea444449c8aca817af"}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({ providers: ["github", "vercel", "supabase"] }),
});
const data = await res.json();
```

## 4. Agent Rules & Permissions (Permission-First)

1. **Explicit Approval for Mutating Actions**:
   - Any destructive or mutating action (modifying repositories, deploying to production, deleting files, database schema alterations) MUST be explicitly confirmed with the user before execution.
2. **Token Security**:
   - Tokens must never be printed in full format in plain logs or exported to version control.
   - Tokens reside only in transient memory during tool execution.
