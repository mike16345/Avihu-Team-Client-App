$projectRoot = (Resolve-Path "$PSScriptRoot\..").Path
$currentMapping = cmd /c subst | Select-String '^X:\\: => (.+)$'

if ($currentMapping) {
  $mappedPath = $currentMapping.Matches[0].Groups[1].Value.Trim()
  if ($mappedPath -ne $projectRoot) {
    cmd /c "subst X: /d" | Out-Null
  }
}

if (-not (Test-Path "X:\package.json")) {
  cmd /c "subst X: `"$projectRoot`"" | Out-Null
}

$env:JAVA_HOME = [Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
$env:ANDROID_HOME = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
$env:ANDROID_SDK_ROOT = [Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "User")

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$userPath;$machinePath"

if (-not $env:JAVA_HOME) {
  throw "JAVA_HOME is not configured for the current user."
}

if (-not $env:ANDROID_HOME) {
  throw "ANDROID_HOME is not configured for the current user."
}
