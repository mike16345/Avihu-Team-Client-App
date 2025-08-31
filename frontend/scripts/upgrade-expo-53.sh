#!/usr/bin/env bash
set -euo pipefail
echo "▶ SDK 53 upgrade clean install"
rm -rf node_modules .expo ios android
npm cache clean --force || true
yarn cache clean || true
npm i || yarn
npx expo install expo@^53 --fix
npx expo install react@^19 react-dom@^19 react-native@0.79.*
npx expo prebuild --clean || true
echo "✔ Done. Build a dev client next."

