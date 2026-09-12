# GEMINI Instructions: Mandatory Code Review Graph & Reporter Policy

## Permanent Mandate
Whenever this AI coding agent writes, modifies, refactors, or fixes code in this repository:
1. **Pre-Check**: Run `code-review-graph impact` or `code-review-graph architecture` before modifying shared code.
2. **Post-Sync**: Run `code-review-graph update` or `code-review-graph build` after making changes.
3. **Integrity**: Run `code-review-graph dead-code` and `code-review-graph detect-changes`.
4. **Build Verification**: Run `compile_applet` (and verify Android APK workflows if Android files are touched).
5. **Always Report**: Append the structured "Code Review Graph পর্যবেক্ষণ ও বিল্ড রেজাল্ট" to the user response every time code is touched.

Skills Reference:
- `/skills/code-review-graph/SKILL.md`
- `/skills/crg-review-reporter/SKILL.md`
- `/skills/niooon-automation/SKILL.md`
- `/skills/material-symbols-icons/SKILL.md`
