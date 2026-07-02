. "$PSScriptRoot\android-local-common.ps1"

Push-Location X:\android
try {
  cmd /c "gradlew.bat app:installDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8082 -PreactNativeArchitectures=arm64-v8a"
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}
