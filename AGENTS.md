# Agent Instructions: NIOOON Platform & Token Vault

## Platform Credentials & Configuration
- **Platform**: NIOOON (`https://nioon.lovable.app`)
- **API Key**: `nio_live_f7b206cbaa68fc4b62a111c9791b2d631c776c338a1d46ea444449c8aca817af`
- **Environment Variable**: `NIOOON_PLATFORM_KEY` (persisted in `/.env`)
- **Installed Packages**:
  - `@niooon/github` (v1.5.2) — CLI & SDK for GitHub, Vercel, Supabase
  - `niooon-manage-token` (v1.0.0) — Token Vault dynamic fetcher with 5m in-memory cache
- **Connected Accounts**:
  - GitHub Account: `niooon-commits`
  - Vercel Account: `niooon-commits`
  - Supabase Account: Connected (`niooon.cc` / `rpagjdzvpaylxnqiddvb`) — Status: ACTIVE_HEALTHY

## Operational Workflow
When performing GitHub, Vercel, or Supabase operations:
1. Retrieve tokens via `NiooonVault` from `niooon-manage-token` or directly from `https://nioon.lovable.app/api/public/vault/tokens` using `process.env.NIOOON_PLATFORM_KEY || "nio_live_f7b206cbaa68fc4b62a111c9791b2d631c776c338a1d46ea444449c8aca817af"`.
2. Use `@niooon/github` SDK classes (`NexusGitHub`, `NexusVercel`, `NexusSupabase`).
3. **Permission-First Guardrail**: Always prompt for explicit user confirmation before executing mutating/destructive actions (e.g. database schema migrations, dropping tables, deploying production releases).
4. See `/skills/niooon-automation/SKILL.md` for full reference and SDK code examples.

## Icon System Guidelines (@expo/material-symbols)
- **Installed Package**: `@expo/material-symbols` (v0.1.1)
- **Skill Reference**: `/skills/material-symbols-icons/SKILL.md`
- **Application Icon Preference**: When building UI applications, use Material Symbols icons from `@expo/material-symbols` (or Material Symbols standards) per the skill instructions.

## Strict Code Review & Intelligence Graph Policy (code-review-graph)
- **Engine**: `code-review-graph` (v2.3.8+), path `/usr/local/bin/code-review-graph`
- **Skill Reference**: `/skills/code-review-graph/SKILL.md` & `/skills/crg-review-reporter/SKILL.md`
- **MANDATORY EXECUTION & REPORTING POLICY**:
  1. **Before Modifying Shared Code**: Always evaluate blast-radius and callers (`code-review-graph impact <target>` or `code-review-graph architecture`) to avoid breaking dependent modules.
  2. **After Modifying Code**: Always execute `code-review-graph update` (or `code-review-graph build`) to keep the local graph, callers, and edges strictly in sync with the codebase.
  3. **Verification & Cleanliness**: Use `code-review-graph detect-changes` and `code-review-graph dead-code` to ensure no orphan components or broken imports are introduced.
  4. **Build Confirmation**: Verify that the application builds successfully using `compile_applet` (or verify Android build if Android code was touched).
  5. **MANDATORY USER REPORTING**: On EVERY turn where code is written or edited, the agent MUST append a structured "Code Review Graph Verification & Build Results" summary detailing:
     - 🏗️ Build Status
     - 🌐 Graph Stats (Nodes, Edges, Indexed Files)
     - 🎯 Blast-Radius & Impact (Affected Components & Handlers)
     - 🔍 Dead-Code & Integrity (Zero Orphan or Broken References)
     - 🛡️ Architecture Health

