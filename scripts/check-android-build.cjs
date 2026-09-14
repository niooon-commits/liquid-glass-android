#!/usr/bin/env node

/**
 * Android CI/CD Build Tracker & Quality Gate for NIOOON liquid-glass-android.
 *
 * Monitors GitHub Actions Android release workflow without wasting AI tokens.
 * Runs in a single self-contained process, tracks build state to completion,
 * extracts artifact/release links on success, or pinpoints compilation errors on failure.
 *
 * Features:
 *  - Caches terminal results in .android-build-status.json to avoid redundant checks
 *  - Dynamic Token acquisition via NIOOON Vault
 *  - Automatic error diagnostic extractor for gradle/kotlin failures
 *  - Supports both standalone CLI usage and programmatic invocation
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO_OWNER = "niooon-commits";
const REPO_NAME = "liquid-glass-android";
const WORKFLOW_NAME = "Build & Release Android App";
const STATUS_CACHE_FILE = path.join(process.cwd(), ".android-build-status.json");
const POLL_INTERVAL_MS = 10000; // 10 seconds between checks inside the process
const DEFAULT_TIMEOUT_MS = 600000; // 10 minutes maximum wait

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGitHubToken() {
  const apiKey =
    process.env.NIOOON_PLATFORM_KEY ||
    "nio_live_f7b206cbaa68fc4b62a111c9791b2d631c776c338a1d46ea444449c8aca817af";

  try {
    const { NiooonVault } = require("niooon-manage-token");
    const vault = new NiooonVault({ apiKey });
    const bundle = await vault.fetchBundle(["github"]);
    if (bundle?.tokens?.github) return bundle.tokens.github;
  } catch (_) {}

  try {
    const res = await fetch("https://nioon.lovable.app/api/public/vault/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-niooon-key": apiKey,
      },
      body: JSON.stringify({ services: ["github"] }),
    });
    const data = await res.json();
    if (data?.tokens?.github) return data.tokens.github;
  } catch (err) {
    console.error("[build-tracker] Token fetch error:", err.message);
  }

  throw new Error("Failed to retrieve GitHub token from NIOOON Vault");
}

function getLocalHeadSha() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
  } catch (_) {
    return null;
  }
}

function loadStatusCache() {
  try {
    if (fs.existsSync(STATUS_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(STATUS_CACHE_FILE, "utf-8"));
    }
  } catch (_) {}
  return {};
}

function saveStatusCache(cache) {
  try {
    fs.writeFileSync(STATUS_CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (_) {}
}

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "niooon-build-tracker",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function fetchText(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "niooon-build-tracker",
    },
  });
  if (!res.ok) return "";
  return res.text();
}

async function extractFailureDiagnostics(runId, token) {
  try {
    const jobsData = await fetchJson(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}/jobs`,
      token
    );
    const failedJob = jobsData.jobs.find((j) => j.conclusion === "failure") || jobsData.jobs[0];
    if (!failedJob) return null;

    const failedStep = failedJob.steps?.find((s) => s.conclusion === "failure");
    const logUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/jobs/${failedJob.id}/logs`;
    const logText = await fetchText(logUrl, token);

    const lines = logText.split("\n");
    const diagnosticLines = lines.filter((l) =>
      l.includes("e: ") ||
      l.includes("ERROR:") ||
      l.includes("FAILURE:") ||
      l.includes("Compilation error") ||
      l.includes("Unresolved reference")
    );

    return {
      failedJobName: failedJob.name,
      failedStepName: failedStep ? failedStep.name : "Unknown",
      diagnostics: diagnosticLines.slice(-10).map((l) => l.replace(/^[0-9TZ:.-]+\s*/, "")),
      totalErrors: diagnosticLines.length,
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function getLatestReleaseInfo(token) {
  try {
    const data = await fetchJson(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/latest`,
      token
    );
    const apkAsset = data.assets?.find((a) => a.name.endsWith(".apk"));
    return {
      releaseUrl: data.html_url,
      tagName: data.tag_name,
      publishedAt: data.published_at,
      apkName: apkAsset?.name,
      apkSizeMb: apkAsset ? (apkAsset.size / (1024 * 1024)).toFixed(2) + " MB" : null,
      apkDownloadUrl: apkAsset?.browser_download_url,
    };
  } catch (_) {
    return null;
  }
}

async function trackAndroidBuild(options = {}) {
  const targetSha = options.sha || getLocalHeadSha();
  const timeoutMs = options.timeout || DEFAULT_TIMEOUT_MS;
  const startTime = Date.now();

  console.log("==================================================");
  console.log(" 📱 Android Build Status Tracker & Quality Gate");
  console.log("==================================================");
  console.log(`Repository:  ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`Workflow:    ${WORKFLOW_NAME}`);
  if (targetSha) {
    console.log(`Target Commit: ${targetSha.slice(0, 10)}`);
  }

  // Check cache to avoid redundant API checks if already completed
  const cache = loadStatusCache();
  if (targetSha && cache[targetSha] && cache[targetSha].status === "completed") {
    const cached = cache[targetSha];
    console.log("\n⚡ Retrieved final result from verified build cache:");
    console.log(`  Conclusion: ${cached.conclusion.toUpperCase()}`);
    console.log(`  Completed At: ${cached.completed_at || cached.updated_at}`);
    console.log(`  Run URL: ${cached.html_url}`);
    if (cached.conclusion === "success" && cached.release) {
      console.log(`  APK Release: ${cached.release.apkDownloadUrl || cached.release.releaseUrl}`);
      console.log(`  APK Size: ${cached.release.apkSizeMb}`);
    } else if (cached.conclusion === "failure" && cached.diagnostics) {
      console.log("  Failure Cause:");
      cached.diagnostics.diagnostics?.forEach((d) => console.log(`    ${d}`));
    }
    console.log("==================================================");
    return cached;
  }

  console.log("\n[tracker] Authenticating with NIOOON Vault...");
  const token = await getGitHubToken();
  console.log("[tracker] Authenticated. Monitoring build status in background...");

  let targetRun = null;
  let attempt = 0;

  while (Date.now() - startTime < timeoutMs) {
    attempt++;
    const runsData = await fetchJson(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=10`,
      token
    );

    const runs = runsData.workflow_runs || [];

    if (targetSha) {
      targetRun = runs.find((r) => r.head_sha === targetSha && r.name === WORKFLOW_NAME);
    } else {
      targetRun = runs.find((r) => r.name === WORKFLOW_NAME);
    }

    if (!targetRun) {
      process.stdout.write(`\r⏳ Waiting for GitHub Actions runner to trigger build... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`);
      await sleep(5000);
      continue;
    }

    if (targetRun.status === "completed") {
      process.stdout.write("\n");
      const durationSeconds = Math.round((new Date(targetRun.updated_at).getTime() - new Date(targetRun.created_at).getTime()) / 1000);

      const result = {
        runId: targetRun.id,
        status: targetRun.status,
        conclusion: targetRun.conclusion,
        head_sha: targetRun.head_sha,
        html_url: targetRun.html_url,
        created_at: targetRun.created_at,
        completed_at: targetRun.updated_at,
        durationSeconds,
      };

      if (targetRun.conclusion === "success") {
        console.log("\n🎉 ==============================================");
        console.log("  BUILD SUCCESS: Android APK Built & Released!");
        console.log("==================================================");
        console.log(`Status:       ${targetRun.conclusion.toUpperCase()}`);
        console.log(`Commit:       ${targetRun.head_sha.slice(0, 10)}`);
        console.log(`Build Time:   ${durationSeconds} seconds`);
        console.log(`Workflow Run: ${targetRun.html_url}`);

        const release = await getLatestReleaseInfo(token);
        if (release) {
          result.release = release;
          console.log(`Release Tag:  ${release.tagName}`);
          console.log(`APK Asset:    ${release.apkName} (${release.apkSizeMb})`);
          console.log(`Download URL: ${release.apkDownloadUrl || release.releaseUrl}`);
        }
        console.log("==================================================");
      } else {
        console.log("\n❌ ==============================================");
        console.log("  BUILD FAILURE: Android Build Encountered Errors");
        console.log("==================================================");
        console.log(`Status:       ${targetRun.conclusion.toUpperCase()}`);
        console.log(`Commit:       ${targetRun.head_sha.slice(0, 10)}`);
        console.log(`Workflow Run: ${targetRun.html_url}`);

        const diagnostics = await extractFailureDiagnostics(targetRun.id, token);
        result.diagnostics = diagnostics;
        if (diagnostics?.diagnostics && diagnostics.diagnostics.length > 0) {
          console.log(`Failed Step:  ${diagnostics.failedStepName}`);
          console.log("Compilation Diagnostics:");
          diagnostics.diagnostics.forEach((d) => console.log(`  • ${d}`));
        } else {
          console.log("Check workflow run logs for full stack trace.");
        }
        console.log("==================================================");
      }

      // Cache terminal state
      if (targetSha) {
        cache[targetSha] = result;
        saveStatusCache(cache);
      }

      return result;
    } else {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      process.stdout.write(`\r🔨 Build in progress... Status: [${targetRun.status}] (${elapsed}s elapsed)   `);
      await sleep(POLL_INTERVAL_MS);
    }
  }

  throw new Error(`Timeout waiting for Android build completion (${timeoutMs / 1000}s)`);
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetSha = args.find((a) => !a.startsWith("--")) || null;

  trackAndroidBuild({ sha: targetSha })
    .then((result) => {
      if (result.conclusion !== "success") {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Build tracker error:", err.message);
      process.exit(1);
    });
}

module.exports = { trackAndroidBuild, getLatestReleaseInfo };
