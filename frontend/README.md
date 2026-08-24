# Frontend developer commands

`npm run app` is the authoritative tenant-aware entry point for starting, validating, and
releasing this app. The legacy package scripts remain temporarily for compatibility, but new
developer and automation workflows should use `npm run app` so tenant and environment selection
are explicit.

`preflight` is the canonical fast preflight action. Add the optional `release` positional only
when selecting the full release preflight.

```bash
npm run app -- preflight --tenant avihu --environment development --yes --dry-run
npm run app -- build android --tenant avihu --profile production --yes --dry-run
```

Detailed EAS and operator procedures will be added with the later release-control tasks.
