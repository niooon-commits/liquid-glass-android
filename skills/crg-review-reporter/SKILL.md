---
name: crg-review-reporter
description: Mandatory post-code observation and review reporter. Automatically analyzes codebase changes with code-review-graph, verifies application build status, and outputs a concise, structured intelligence summary for every code modification.
---

# Code Review Graph (CRG) Automated Observer & Reporter Skill

## 1. Skill Purpose & Inviolable Mandate
Whenever code is written, modified, refactored, or fixed in this repository:
1. The agent **MUST** run `code-review-graph` observation commands.
2. The agent **MUST** verify and compile the application (`compile_applet` for Web, or CI verification for Android).
3. The agent **MUST** present a standardized, concise **"Code Review Graph রেজাল্ট ও বিল্ড পর্যবেক্ষণ"** summary in the final response to the user.

> **CRITICAL**: This is a mandatory protocol. The agent must NEVER finish a code-editing turn without executing this observation and appending the concise review result.

---

## 2. Mandatory 4-Step Execution Pipeline

### Step 1: Pre/Post Graph Synchronization
Immediately after editing files:
```bash
# Update the incremental graph with newly written or modified files:
/usr/local/bin/code-review-graph update || /usr/local/bin/code-review-graph build
```

### Step 2: Impact & Architecture Analysis
Examine the blast radius and cross-module couplings:
```bash
# Analyze impact of the modified files:
/usr/local/bin/code-review-graph impact --files <modified_files>

# Check architectural stability and cross-community edges:
/usr/local/bin/code-review-graph architecture
```

### Step 3: Dead Code & Orphan Symbol Scan
Verify that no orphan symbols or broken connections were left behind:
```bash
/usr/local/bin/code-review-graph dead-code
```

### Step 4: Application Build & Compilation Check
- Run `compile_applet` tool to guarantee the web application compiles without TypeScript or Vite errors.
- If Android native code was modified, verify Kotlin syntax or trigger GitHub Actions CI build check.

---

## 3. Mandatory User Response Template
Every response containing code edits must conclude with this structured summary (in Bengali or matching the user's language):

```markdown
### 📊 Code Review Graph পর্যবেক্ষণ ও বিল্ড রেজাল্ট:
- 🏗️ **বিল্ড স্ট্যাটাস**: [সফল (Compiled Successfully) / ত্রুটিহীন]
- 🌐 **গ্রাফ পরিসংখ্যান**: [X টি নোড, Y টি এজ, Z টি ফাইল ইনডেক্সড]
- 🎯 **ব্লাস্ট-রেডিয়াস ও ইমপ্যাক্ট**: [পরিবর্তিত ফাইল এবং প্রভাবিত কম্পোনেন্ট/ফাংশনসমূহ]
- 🔍 **ডেড-কোড ও ক্লিনলিনেস**: [কোনো অনাথ বা ব্রোকেন রেফারেন্স নেই / ফলাফল]
- 🛡️ **আর্কিটেকচার হেলথ**: [মডিউল কাপলিং স্বাভাবিক ও সুরক্ষিত]
```

---

## 4. Never-Forget Rule Enforcement
- This skill is reinforced by persistent instructions in `AGENTS.md` and `GEMINI.md`.
- Even if the user does not explicitly ask for a review, the agent must automatically perform this check and include the summary report whenever code changes are made.
