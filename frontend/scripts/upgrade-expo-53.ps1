$ErrorActionPreference = "Stop"
Write-Host "▶ SDK 53 upgrade clean install"
Remove-Item -Recurse -Force node_modules,.expo,ios,android -ErrorAction SilentlyContinue
npm cache clean --force
yarn cache clean
if (Test-Path package-lock.json) { npm i } else { yarn }
npx expo install expo@^53 --fix
npx expo install react@^19 react-dom@^19 react-native@0.79.*
try { npx expo prebuild --clean } catch {}
Write-Host "✔ Done. Build a dev client next."

