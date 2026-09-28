# Local Android mobile E2E

This suite runs five read-only Maestro flows against the Avihu preview app and the existing `/test`
API stage. It never selects a database at runtime and it refuses to launch unless the operator
explicitly declares `APP_ENV=preview` and a test-stage API URL.

## One-time setup

Install Java 17 or newer, Android platform tools, and Maestro:

```bash
java -version
adb version
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro
maestro --version
```

Start an Android emulator in Android Studio, or connect and authorize a physical Android device.
Confirm that exactly the intended device is available:

```bash
adb devices
```

## Build and install the preview APK

The EAS `preview` environment must define the public Expo variables used by the preview app,
including `API_URL_PREVIEW` pointing to the `/test` Lambda stage. The `e2e-test` profile produces an
internal Android APK with `APP_TENANT=avihu` and `APP_ENV=preview`.

```bash
npm run build:android:e2e
adb install -r /absolute/path/to/downloaded-e2e-build.apk
```

The expected Android package is `com.avihuteam.avihuteam`. The runner verifies that package is
installed before it starts Maestro.

## Run the suite

Use a dedicated, non-customer test account. Keep the credentials in the shell or a secret manager;
do not place them in YAML, documentation, screenshots, or committed environment files.

```bash
export APP_ENV=preview
export E2E_API_URL="https://your-preview-api.example/test"
export MAESTRO_E2E_EMAIL="<dedicated-test-account-email>"
export MAESTRO_E2E_PASSWORD="<dedicated-test-account-password>"

npm run e2e:preflight
npm run e2e:android
```

The five flows cover fresh launch, client-side login validation, rejected login, successful login,
and authenticated workout/diet/profile navigation followed by logout. They only read and navigate;
they do not create, edit, complete, or remove customer data.

The HTML report is written to `.maestro-artifacts/report.html`. Failure diagnostics and screenshots
are written below `.maestro-artifacts/`; the entire directory is ignored by Git. After Maestro
exits, the runner automatically replaces the exact test-account email and password in text
artifacts before it reports success or failure.

## Common fixes

- `Maestro CLI is unavailable`: run the Homebrew installation above and open a new shell.
- `No authorized Android device`: start an emulator, accept the authorization prompt on a physical
  device, or run `adb kill-server` followed by `adb start-server`.
- `Expected preview app is not installed`: install the APK with `adb install -r` and verify it with
  `adb shell pm path com.avihuteam.avihuteam`.
- Environment rejection: confirm `APP_ENV` is exactly `preview` and `E2E_API_URL` ends in `/test`.
- Login failure: verify the dedicated account exists in the current test-stage data and that the
  exported variables are nonblank. The runner redacts their values from console diagnostics and
  generated text artifacts.
