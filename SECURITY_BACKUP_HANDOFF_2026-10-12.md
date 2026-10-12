## Standing continuity requirement (explicit user confirmation)
Following each project modification/security or backup action, future assistants MUST update the three handoffs with the exact action, branch/commit/test/approval/result and the next resume step. This is a permanent requirement. See AGENTS.md, first section, and the latest chronological checkpoint. The user authorized the documentation-only PR #21 to be merged after safety checks; no gameplay or Pages configuration changes were authorized.

# AREG Kids Game — Security & Backup Handoff (2026-10-12)

> **Status:** documentation-only record, based on the user's actual Git Bash outputs and the live GitHub `main` SHA checked on 2026-10-12. Do not confuse a successful Git archive test with a test of all game runtime behavior. **Never change gameplay, live Pages URL, PWA cache, or `main` without explicit user approval.**

## Canonical project state

- Repository: `hamulik003-cyber/areg-kids-game` (**PUBLIC** when checked).
- Official game URL: https://hamulik003-cyber.github.io/areg-kids-game/
- User-approved **V290 PRELIMINARY FINAL** baseline; preserve all previously approved UI, animations, 1-second Settings/avatar hold, score/star economy, audio, gallery/3D assets, persistent localStorage and IndexedDB, Service Worker / DotKiosk behavior.
- Actual `main` SHA checked in GitHub **2026-10-12**: `1fc6781a6b8ec07d89fcf3b377a2eb4087fe9e96` (documentation-only release-history commit). This matched the user's locally archived `main` SHA in the recovery test. **Always re-fetch main on future chats; a newer commit is not automatically approved.**

## Verified local archive and recovery work (user supplied terminal output)

Local Windows PC: Git for Windows installed; Git LFS installed (`git-lfs/3.8.0`). Files are stored under a local folder named `AREG GAME BACKUP`:

1. `areg-kids-game-main.zip`: earlier downloaded `main` working-tree ZIP (not a Git-history backup).
2. `areg-kids-game-mirror.git`: obtained by `git clone --mirror https://github.com/hamulik003-cyber/areg-kids-game.git areg-kids-game-mirror.git`. Clone finished successfully: **7,410 Git objects**, about **836.56 MiB** transferred, **3,992 deltas** resolved. `git fsck --full` succeeded with no reported object errors. `git ... branch | wc -l` reported **174** branches.
3. `git lfs version` worked. `git -C areg-kids-game-mirror.git lfs ls-files --all` returned no entries; no tracked LFS files were found among available refs. Do not infer that device-local uploaded media or remote secrets are archived.
4. `areg-kids-game-full.bundle`: created via `git -C areg-kids-game-mirror.git bundle create ../areg-kids-game-full.bundle --all`. `git -C areg-kids-game-mirror.git bundle verify ../areg-kids-game-full.bundle` returned **192 refs**, `The bundle records a complete history`, `... is okay`. These refs comprise **174 branch heads + 17 PR head refs + HEAD**.
5. `areg-kids-game-restore-test`: created by `git clone -b main ./areg-kids-game-full.bundle ./areg-kids-game-restore-test` without downloading from GitHub. It received all **7,410 objects** and resolved **3,992 deltas**. `git ... status --short --branch` produced `## main...origin/main` (clean working tree), where `origin` is the local bundle.
6. `git -C areg-kids-game-mirror.git rev-parse refs/heads/main && git -C areg-kids-game-restore-test rev-parse HEAD` showed exactly the same SHA on both lines: **`1fc6781a6b8ec07d89fcf3b377a2eb4087fe9e96`**. **Git bundle restoration and main commit equality are VERIFIED**. A full offline browser/gameplay run from the restored folder has **NOT** yet been executed.

## Security and availability decisions

- Earlier the user enabled GitHub two-factor authentication, passkey/recovery options and set up a branch ruleset called `AREG Main Protection` (according to prior guided account setup). **Recheck live state before relying on any specific rule or required CI check**; never reveal/copy recovery secrets into repository files, ChatGPT or GitHub issues.
- Local backups are **snapshots**: new GitHub commits made after the snapshot are not automatically protected. They are also **on one computer**, so a second encrypted offline/offsite copy (USB/external storage) remains outstanding. USB transfer was intentionally postponed by user.
- Bundle/mirror includes Git data, **not** GitHub Pages configuration, GitHub Actions secrets, external provider accounts or user-device localStorage/IndexedDB, stars, locally uploaded custom music. Those need separate protection/approach.
- The repo is currently **public**. Turning it `Private` on a GitHub Free account can disrupt public GitHub Pages; **DO NOT toggle Private** or change domain/Pages source as a speculative security measure. Browser-delivered JS/media can still be inspected or copied from a running site, even when its source repo is private.
- GitHub Free/public GitHub Pages is not a perpetual contractual guarantee; limits and terms can change. No known automatic six-month/one-year deletion timer is implied by the user's current setup. For future paid/personalized customer games, evaluate hosting appropriate for commercial use, independent backups, maintainability and migrations. Do not promise that all GitHub Pages terms permit any business use.
- The user expects to **continue instructing ChatGPT to edit the game exactly as before**. Preserve the workflow: inspect fresh GitHub `main` + AGENTS.md + CURRENT_STATUS.md + PROJECT_HANDOFF.md + NEW_CHAT_HANDOFF.md, create isolated trial branch, test, request user sign-off, merge to `main` only with explicit authorization, validate deployment and protect saved user data. Branch protection may require pull requests and required CI checks; it does not prevent continued development.

## Exact next step (not performed yet)

1. Ask user to open **GitHub → Repository Settings → Pages**, send screenshot; **read-only inspection**, no toggles or changes.
2. Examine present deployment/public exposure and make a safe plan for future private development with separately deployed build; never migrate a live PWA origin casually because installed devices have locally saved data.
3. Arrange **separate external encrypted backup** of the verified bundle and optionally bare mirror when user is ready; test a copy on independent storage.
4. Consider recording backup-refresh process and recovery plan for future customer games, including external service configurations and device-local user data.
5. This note and any handoff-pointer updates were authored **on documentation-only branch `docs/security-backup-handoff-20261012`**. Leave protected `main` unchanged unless user explicitly approves documentation PR merge.

## User request for future ChatGPT chats

The user specifically said: **«հիմա ինչ անում ենք դու գրի մեր պատմուցյունների մեջ որ հաջորդ չաթերնել տեղյակ լինեն»**. Future chats must reuse this verified checkpoint instead of asking the user to redo the mirror/bundle/restoration steps or treating this as an emergency disappearance of games. Explain calmly that there is no known forced expiry, while being candid about future service/provider risks. 
