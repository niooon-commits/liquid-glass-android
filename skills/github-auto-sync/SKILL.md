---
name: github-auto-sync
description: Automatic Git synchronization and release pipeline. Automatically commits and pushes all workspace changes to GitHub (niooon-commits/liquid-glass-android) using NIOOON Token Vault, preventing uncommitted or unpushed work across turns.
---

# GitHub Auto-Sync & Continuous Delivery Skill

## 1. Skill Purpose & Inviolable Mandate
Whenever any code, file, or configuration is written, modified, refactored, or fixed in this repository:
1. The agent **MUST NEVER** conclude a turn leaving uncommitted or unpushed changes in the workspace.
2. The agent **MUST** execute the automated sync engine:
   ```bash
   node scripts/git-auto-sync.cjs "[Descriptive commit message]"
   # Or via npm script:
   npm run git:sync
   ```
3. The sync script handles:
   - Dynamic token retrieval from NIOOON Token Vault (`niooon-manage-token`).
   - Git identity setup (`niooon-commits` / `niooon@cinelink.fun`).
   - Adding all changes (`git add -A`).
   - Descriptive semantic commit creation.
   - Pushing to remote branch `main` on `niooon-commits/liquid-glass-android`.
   - Purging credentials from `.git/config` to maintain clean remote security.
4. The agent **MUST** confirm the push status in the user report.

---

## 2. Execution Commands

### Standard Execution:
```bash
node scripts/git-auto-sync.cjs "feat(android): description of changes"
```

### Script Location:
- Engine: `/scripts/git-auto-sync.cjs`
- Target Remote: `https://github.com/niooon-commits/liquid-glass-android.git`
- Target Branch: `main`

---

## 3. Workflow Integration
When code is touched:
1. Edit code files (`edit_file` / `create_file`).
2. Run validation (`lint_applet` / `compile_applet`).
3. **Execute Auto-Sync**: `node scripts/git-auto-sync.cjs "<commit message>"`.
4. Check GitHub Actions workflow status to verify CI/CD release build.
5. Provide user summary with commit SHA and release status.
