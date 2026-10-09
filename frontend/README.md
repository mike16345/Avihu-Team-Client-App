# Frontend tenant development

`npm run app` is the authoritative tenant-aware entry point for developing, validating, and
releasing this app. Its short top-level menu is grouped into **Develop & run**, **Verify app**,
**Release app**, and **Manage assets**, and it never silently chooses production.

After a command succeeds, `npm run app` adds **Run previous command** after the tenant choices.
The shortcut shows the resolved command and asks for confirmation before running it. The equivalent
direct shortcut is `npm run app -- previous`; it also always requires confirmation.

`preflight` is the canonical fast preflight action. Add the optional `release` positional only
when selecting the full release preflight.

```bash
npm run app -- preflight --tenant avihu --environment development --yes --dry-run
npm run app -- run android --tenant avihu --environment production --yes --dry-run
npm run app -- build android --tenant avihu --profile production --yes --dry-run
```

Remove `--dry-run` only after reviewing the selection summary. Build actions run local
noninteractive preflight before the pinned EAS command, and EAS repeats applicable checks remotely.

See [docs/release-control.md](docs/release-control.md) for tenant onboarding, assets, EAS
environments, fast/release preflight, R8 artifacts, edge-to-edge device checks, and recovery.

## Sentry error reporting

Avihu sends unexpected client errors to the `avihuteam/avihu-mobile` project.
Uncaught JavaScript errors and native crashes are SDK-owned; handled exceptions use
`reportError(error, { operation, diagnostics })`. React Query reports final failures
after retries, unless a feature declares `meta.errorReporting.owner: "feature"`.
Retain the original Error. Skip only a documented expected outcome.

Diagnostic context retains form answers, question/file indices, upload stage, status,
request IDs and available MIME/size. Credentials and signed URL authorization parameters
are redacted. Context is bounded; binary photos, replay, screenshots, tracing and profiling
are disabled.

The native SDK changes Avihu's binary/runtime to **2.4.1**. Build a new binary before
publishing updates for this runtime. A 2.4.0 binary cannot receive these updates.
The public DSN belongs in tenant monitoring configuration. Upload credentials do not.

Create a Sentry organization auth token with source-map upload permissions and add
`SENTRY_AUTH_TOKEN` to the selected preview and production EAS environments with
**sensitive** visibility. Preflight verifies the selected remote environment and clears
inherited local values before probing. Secret visibility cannot be verified via
`eas env:exec`. For local native Release builds and OTA uploads, also provide the token
in the invoking process environment; never put it in Expo extra or an EXPO_PUBLIC variable.
Native Release builds upload JS maps and native debug files through the Expo Sentry plugin.
Debug builds do not require upload credentials.

Use the existing selected commands:

```sh
npm run app -- build ios --tenant avihu --profile preview --yes
npm run app -- update --tenant avihu --environment preview --yes
```

For monitored tenants, update runs preflight, checks the local upload credential, publishes
into a new invocation directory under ignored `.sentry-artifacts`, then uploads those
exact maps. The pinned EAS CLI uses `--input-dir` for its bundle output; it has no
`--output-dir` flag. A publication manifest records tenant/environment/runtime/destination
and artifact hashes. Keep the directory if upload fails: the update is already published.
Retry **only** that upload, without another publication:

```sh
npm run app -- sentry-upload --tenant avihu --environment preview --artifacts .sentry-artifacts/avihu/preview/<invocation-id> --yes
```

Retry rejects modified artifacts and mismatched selections. The installed SDK uploader
interpolates paths into a shell command, so this workflow requires a workspace path
without spaces or shell characters. Dry-run prints the steps without publishing.
