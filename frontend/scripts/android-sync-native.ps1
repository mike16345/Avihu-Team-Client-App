. "$PSScriptRoot\android-local-common.ps1"

Push-Location X:\
try {
  npx expo prebuild --platform android --no-install
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}
