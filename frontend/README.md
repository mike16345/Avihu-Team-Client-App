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

## iOS simulators with Xcode 27

The repository Expo launcher adapts SDK 53's simulator prerequisite and window activation to
Xcode 27's Device Hub. It uses the selected Xcode installation and focuses the requested simulator
by UDID. Simulator IDs from `simctl` are excluded from Xcode 27's connected physical-device list,
so selecting a simulator keeps the simulator build path and avoids physical-device signing setup.
Earlier Xcode versions keep Expo's standard Simulator launcher.

```bash
npm run app -- run ios --tenant avihu --environment development --device "iPhone Air" --yes
```

Use `npm run app` for Metro as well; its iOS keyboard shortcut uses the same adapter. The legacy
`npm start`, `npm run start-no-clear`, and `npm run ios` scripts also use it, and still require explicit
`APP_TENANT` and `APP_ENV` values. Direct `npx expo` commands bypass this repository adapter.
The adapter targets the installed `@expo/cli` 0.24.24 and must be reviewed when upgrading Expo.
