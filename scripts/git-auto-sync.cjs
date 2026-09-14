#!/usr/bin/env node

/**
 * Automated GitHub Synchronizer for NIOOON liquid-glass-android repository.
 * Fetches token securely from NiooonVault, stages all changes, commits, and pushes to origin/main.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO_OWNER = "niooon-commits";
const REPO_NAME = "liquid-glass-android";
const DEFAULT_BRANCH = "main";
const GIT_USER_NAME = "niooon-commits";
const GIT_USER_EMAIL = "niooon@cinelink.fun";

async function getGitHubToken() {
  const apiKey = process.env.NIOOON_PLATFORM_KEY || "nio_live_f7b206cbaa68fc4b62a111c9791b2d631c776c338a1d46ea444449c8aca817af";

  // Method 1: niooon-manage-token SDK
  try {
    const { NiooonVault } = require("niooon-manage-token");
    const vault = new NiooonVault({ apiKey });
    const bundle = await vault.fetchBundle(["github"]);
    if (bundle?.tokens?.github) {
      return bundle.tokens.github;
    }
  } catch (err) {
    console.warn("[auto-sync] NiooonVault SDK fallback:", err.message);
  }

  // Method 2: Direct HTTP fetch
  try {
    const res = await fetch("https://nioon.lovable.app/api/public/vault/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-niooon-key": apiKey
      },
      body: JSON.stringify({ services: ["github"] })
    });
    const data = await res.json();
    if (data?.tokens?.github) {
      return data.tokens.github;
    }
  } catch (err) {
    console.error("[auto-sync] Direct HTTP vault fetch failed:", err.message);
  }

  throw new Error("Unable to retrieve GitHub token from NIOOON Vault");
}

function runCmd(cmd, options = {}) {
  return execSync(cmd, { encoding: "utf-8", stdio: options.stdio || "pipe" });
}

async function autoSync() {
  console.log("==========================================");
  console.log(" 🚀 NIOOON GitHub Auto-Sync Engine Starting");
  console.log("==========================================");

  // 1. Check if git repo exists
  try {
    runCmd("git rev-parse --is-inside-work-tree");
  } catch (e) {
    console.log("[auto-sync] Initializing git repository...");
    runCmd(`git init -b ${DEFAULT_BRANCH}`);
  }

  // 2. Configure user credentials
  try {
    runCmd(`git config user.name "${GIT_USER_NAME}"`);
    runCmd(`git config user.email "${GIT_USER_EMAIL}"`);
  } catch (e) {
    console.warn("[auto-sync] Warning configuring git user:", e.message);
  }

  // 3. Inspect git status
  const statusOutput = runCmd("git status -s").trim();
  const unpushedCommits = (() => {
    try {
      return runCmd(`git log origin/${DEFAULT_BRANCH}..HEAD --oneline`).trim();
    } catch (_) {
      return "";
    }
  })();

  if (!statusOutput && !unpushedCommits) {
    console.log("✅ Working tree is completely clean and all commits are pushed to remote.");
    return;
  }

  console.log("Detected changes:\n" + (statusOutput || "(Unpushed local commits only)"));

  // 4. Retrieve Token
  console.log("\n[auto-sync] Fetching GitHub credentials from NIOOON Vault...");
  const token = await getGitHubToken();
  console.log("[auto-sync] GitHub token acquired successfully.");

  // 5. Stage changes if any
  if (statusOutput) {
    runCmd("git add -A");

    // Formulate descriptive commit message
    const rawArgs = process.argv.slice(2);
    const checkBuildRequested = rawArgs.includes("--check-build") || rawArgs.includes("-b");
    const customMsg = rawArgs.filter(a => !a.startsWith("--") && !a.startsWith("-")).join(" ").trim();
    let commitMsg = customMsg;

    if (!commitMsg) {
      // Auto-generate based on modified areas
      const changedFiles = statusOutput.split("\n").map(l => l.slice(3).trim());
      const hasAndroid = changedFiles.some(f => f.startsWith("android/"));
      const hasSrc = changedFiles.some(f => f.startsWith("src/"));

      if (hasAndroid && hasSrc) {
        commitMsg = "feat: update Android app and Web components";
      } else if (hasAndroid) {
        commitMsg = "feat(android): optimize web view, ad-blocker and browser stability";
      } else if (hasSrc) {
        commitMsg = "feat(web): update UI components and state logic";
      } else {
        commitMsg = "chore: synchronize repository changes";
      }
    }

    console.log(`[auto-sync] Creating commit: "${commitMsg}"...`);
    runCmd(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
  }

  // 6. Set authenticated remote safely
  const authRemoteUrl = `https://x-access-token:${token}@github.com/${REPO_OWNER}/${REPO_NAME}.git`;
  const cleanRemoteUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}.git`;

  try {
    runCmd("git remote remove origin");
  } catch (_) {}
  runCmd(`git remote add origin "${authRemoteUrl}"`);

  // 7. Push to remote
  console.log(`[auto-sync] Pushing changes to ${REPO_OWNER}/${REPO_NAME} (${DEFAULT_BRANCH})...`);
  try {
    runCmd(`git push origin ${DEFAULT_BRANCH}`, { stdio: "inherit" });
    console.log("\n✅ SUCCESS: Changes pushed to GitHub successfully!");
  } catch (err) {
    console.warn("[auto-sync] Push conflict detected, attempting rebase...");
    runCmd(`git pull --rebase origin ${DEFAULT_BRANCH}`);
    runCmd(`git push origin ${DEFAULT_BRANCH}`, { stdio: "inherit" });
    console.log("\n✅ SUCCESS: Changes rebased and pushed to GitHub successfully!");
  } finally {
    // 8. Always sanitize remote URL to prevent token leakage in .git/config
    runCmd(`git remote set-url origin "${cleanRemoteUrl}"`);
    console.log("[auto-sync] Sanitized git remote URL (token purged from disk).");
  }

  // 9. Display latest commit SHA
  const latestCommit = runCmd("git log -1 --oneline").trim();
  const latestHeadSha = runCmd("git rev-parse HEAD").trim();
  console.log(`[auto-sync] Remote is now at: ${latestCommit}`);
  console.log("==========================================");

  // 10. Automatically check Android CI build if requested or if android files were modified
  const rawArgs = process.argv.slice(2);
  const checkBuildRequested = rawArgs.includes("--check-build") || rawArgs.includes("-b");
  if (checkBuildRequested) {
    console.log("\n[auto-sync] Triggering Android CI/CD build tracker...");
    const { trackAndroidBuild } = require("./check-android-build.cjs");
    await trackAndroidBuild({ sha: latestHeadSha });
  }
}

autoSync().catch(err => {
  console.error("❌ Auto-sync failed:", err.message);
  process.exit(1);
});
