# Frontend tenant development

`npm run app` is the authoritative tenant-aware entry point for starting, validating, and
releasing this app. It opens an explicit tenant/environment/action selector and never silently
chooses production.

`preflight` is the canonical fast preflight action. Add the optional `release` positional only
when selecting the full release preflight.

```bash
npm run app -- preflight --tenant avihu --environment development --yes --dry-run
npm run app -- build android --tenant avihu --profile production --yes --dry-run
```

Remove `--dry-run` only after reviewing the selection summary. Build actions run local
noninteractive preflight before the pinned EAS command, and EAS repeats applicable checks remotely.

See [docs/release-control.md](docs/release-control.md) for tenant onboarding, assets, EAS
environments, fast/release preflight, R8 artifacts, edge-to-edge device checks, and recovery.
