---
name: code-review-graph
description: Mandatory local-first code intelligence graph for token-efficient, blast-radius-aware code modifications, architectural validation, dead-code detection, and integrity checks across Kotlin, TypeScript, TSX, and Bash.
---

# Code Review Graph (CRG) Skill

## 1. Overview & Mandatory Policy
This codebase utilizes **`code-review-graph`** (v2.3.8+), a local-first code intelligence graph engine powered by Tree-sitter and SQLite.

> **CRITICAL RULE**: Whenever modifying, refactoring, or adding code to this project, the agent **MUST** leverage `code-review-graph` to maintain structural integrity, verify cross-component caller impacts, and ensure minimal token waste.

- **CLI Executable**: `/usr/local/bin/code-review-graph` (also directly `code-review-graph` in PATH)
- **Local Database**: `.code-review-graph/`
- **Supported Languages**: TypeScript, TSX, Kotlin, Bash, Python, etc.

---

## 2. Core Operational Workflow for Every Code Edit

### Step 1: Pre-Change Impact Assessment (Blast Radius)
Before editing existing shared interfaces, components, or services:
```bash
# Check the blast radius and impacted callers/dependencies:
code-review-graph impact <entity_or_file>

# Or analyze cross-community architectural coupling:
code-review-graph architecture
```

### Step 2: Post-Change Incremental Indexing
Immediately after writing or modifying files, update the knowledge graph so that callers and edges remain strictly synchronized:
```bash
# Incrementally parse only changed files:
code-review-graph update

# Or analyze changed impacts without full re-parse:
code-review-graph detect-changes
```

### Step 3: Integrity & Dead Code Verification
Verify that new changes do not leave orphaned functions or broken connections:
```bash
# Check for unreferenced/dead functions or unused exports:
code-review-graph dead-code

# Check graph status and health:
code-review-graph status
```

---

## 3. Command Quick Reference

| Command | Purpose |
|---|---|
| `code-review-graph update` | Incrementally re-parses modified files into the local graph. |
| `code-review-graph detect-changes` | Evaluates blast radius and impacted nodes against recent git diff. |
| `code-review-graph impact <target>` | Traces callers, dependents, and tests affected by a specific file or symbol. |
| `code-review-graph architecture` | Summarizes community clustering, cross-module coupling, and warnings. |
| `code-review-graph dead-code` | Identifies orphan functions, unused components, and broken targets. |
| `code-review-graph build` | Performs a complete full re-index of all 35+ project files. |
| `code-review-graph status` | Shows total indexed nodes, edges, languages, and last update timestamp. |
| `code-review-graph serve` | Runs the MCP server protocol for graph-aware tools. |

---

## 4. Architectural Guidelines
- **Community Coupling**: Keep cross-community edges clean (e.g. between `src/components`, `src/firebase`, and `android/app/.../ui`).
- **Single Source of Truth**: All UI and Android bridge interactions must be reflected in the graph.
- **Never bypass graph updates** when introducing new modules or interfaces.
