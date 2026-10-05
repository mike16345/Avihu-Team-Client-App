# Local Android mobile E2E

This suite runs thirteen Maestro flows against the Avihu preview app and the existing `/test` API
stage. It never selects a database at runtime and it refuses to launch unless the operator
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

Use a dedicated, non-customer test account. Copy the committed template to the ignored local E2E
environment file, then fill in the preview `/test` API URL and test-account credentials. Do not
place real credentials in YAML, documentation, screenshots, or committed environment files.

```bash
cp .env.e2e.example .env.e2e.local
```

The local file must define:

```dotenv
APP_ENV=preview
E2E_API_URL=https://your-preview-api.example/test
MAESTRO_E2E_EMAIL=dedicated-test-account@example.invalid
MAESTRO_E2E_PASSWORD=replace-with-local-test-password
```

Both npm commands load `.env.e2e.local` automatically:

```bash
npm run e2e:preflight
npm run e2e:android
```

The thirteen flows cover fresh launch, client-side login validation, rejected login, successful
login, authenticated workout/diet/profile navigation followed by logout, forgot-password
navigation and validation, the transition from a successful OTP request to malformed-code
validation, session restoration after an app relaunch, the Home dashboard and notification modal,
Chat composer enablement without sending, the Articles landing page, and Profile details with back
navigation. The OTP flow sends one email to the dedicated test account but does not validate the
emailed code or change the password. The remaining flows only authenticate, read, navigate, and
prepare an unsent local Chat draft; they do not create, edit, complete, or remove customer data.

The HTML report is written to `.maestro-artifacts/report.html`. Failure diagnostics and screenshots
are written below `.maestro-artifacts/`; the entire directory is ignored by Git. After Maestro
exits, the runner automatically replaces the exact test-account email and password in text
artifacts before it reports success or failure.

The flows cap post-tap UI settling at 500 ms while retaining Maestro's reliable `inputText`
command. Screen transitions still use visible-state assertions, so API and navigation waits remain
condition-based rather than fixed delays.

## Common fixes

- `Maestro CLI is unavailable`: run the Homebrew installation above and open a new shell.
- `No authorized Android device`: start an emulator, accept the authorization prompt on a physical
  device, or run `adb kill-server` followed by `adb start-server`.
- `Expected preview app is not installed`: install the APK with `adb install -r` and verify it with
  `adb shell pm path com.avihuteam.avihuteam`.
- Environment rejection: confirm `.env.e2e.local` exists, `APP_ENV` is exactly `preview`, and
  `E2E_API_URL` ends in `/test`.
- Login failure: verify the dedicated account exists in the current test-stage data and that the
  exported variables are nonblank. The runner redacts their values from console diagnostics and
  generated text artifacts.
