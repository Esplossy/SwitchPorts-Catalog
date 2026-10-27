#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

if [ -f "$PROJECT_DIR/.android-build-env" ]; then
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.android-build-env"
else
  echo "Arquivo .android-build-env não encontrado. Execute scripts/setup-android-debug.sh primeiro."
  exit 1
fi

if [ ! -d "$PROJECT_DIR/android" ]; then
  npx expo prebuild --platform android --no-install
fi

cd "$PROJECT_DIR/android"
NODE_ENV=production ./gradlew assembleRelease

mkdir -p "$PROJECT_DIR/artifacts"
cp -f "$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk" "$PROJECT_DIR/artifacts/SwitchPorts-debug.apk"
printf '\nAPK criado em: %s\n' "$PROJECT_DIR/artifacts/SwitchPorts-debug.apk"
ls -lh "$PROJECT_DIR/artifacts/SwitchPorts-debug.apk"
