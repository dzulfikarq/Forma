# Private repository distribution contract

## Current behavior

Forma exports and installs local portable bundles only. Export/install makes no GitHub requests and reads or writes no credentials. GitHub fetching and Project Generator integration remain unimplemented.

Portable bundles carry a SHA-256 file manifest and payload hash. Installer checks each file, cross-checks runtime/build/adapter dependency manifests, rejects non-registry dependency specs and unsafe cross-platform paths, then enforces per-template adapter compatibility. Hashes detect accidental or partial modification; they do not prove publisher identity.

## Future authenticated fetch contract

Any future private-repository fetcher must meet these requirements before implementation:

- Fetch only from an allowlisted repository and an explicit template ID. Reject arbitrary hosts, repository paths, and redirects outside GitHub's approved API/download hosts.
- Require a full commit SHA or semver release tag; never accept a branch. Resolve tags to and record their full commit SHA. Protect release tags from replacement.
- Authenticate only in a trusted local CLI or server-side service. Never send credentials to browser code, generated projects, template source, URLs, command-line arguments, logs, telemetry, or error text.
- Prefer short-lived GitHub App installation tokens scoped to `Contents: read` for this repository. For an interactive developer CLI, reuse `gh`'s existing authenticated session instead of asking users to paste tokens. Any unavoidable token must be short-lived, least-privilege, held in memory only, and redacted from diagnostics.
- Send credentials only in HTTPS `Authorization: Bearer` headers. Never persist a token in `.env`, config, cache, downloaded archive, install report, or project output. Fail closed on authentication/authorization errors.
- Fetch the exact immutable revision, validate repository identity and resolved commit, then validate bundle format, SHA-256 manifest, dependency manifests, and paths before install. Keep temporary downloads outside the target and remove them on failure.
- Treat bundle SHA-256 as corruption detection, not provenance. Strong publisher authenticity would need a separately verified signed release or attestation; do not imply that v1 bundles provide this.

For Project Generator, use a server-side credential broker or GitHub App installation flow; never expose a private-repository token in a client or generated workspace. This document defines a future contract only; it does not authorize fetching, publishing, repository visibility changes, or Project Generator work.

## Source reference policy

Release registry references must be immutable semver tags or full commit SHAs, never branches. Prefer recording the resolved full commit SHA alongside a release tag. Keep package version, template version, and release record aligned; publish only through an explicitly approved manual process.
