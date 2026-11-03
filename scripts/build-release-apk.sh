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

if ! command -v keytool >/dev/null 2>&1; then
  echo "keytool não encontrado. Instale o JDK 17 antes do build release."
  exit 1
fi

if [ ! -d "$PROJECT_DIR/android" ]; then
  npx expo prebuild --platform android --no-install
fi

KEYSTORE="$PROJECT_DIR/android/app/switchports-release.keystore"
PASSWORD_FILE="$PROJECT_DIR/.release-keystore.env"
if [ ! -f "$PASSWORD_FILE" ]; then
  umask 077
  printf 'SWITCHPORTS_RELEASE_PASSWORD=%s\n' "$(openssl rand -hex 24)" > "$PASSWORD_FILE"
fi
# shellcheck disable=SC1090
source "$PASSWORD_FILE"

if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -storepass "$SWITCHPORTS_RELEASE_PASSWORD" \
    -keypass "$SWITCHPORTS_RELEASE_PASSWORD" \
    -alias switchports-release \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=SwitchPorts Catalog, OU=Mobile, O=SwitchPorts, L=Cloud, ST=NA, C=BR"
fi

python3 - "$PROJECT_DIR/android/app/build.gradle" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
text = path.read_text()
if "switchports-release.keystore" not in text:
    text = text.replace(
        "        }\n    }\n    buildTypes {",
        "        }\n        release {\n            storeFile file('switchports-release.keystore')\n            storePassword System.getenv('SWITCHPORTS_RELEASE_PASSWORD')\n            keyAlias 'switchports-release'\n            keyPassword System.getenv('SWITCHPORTS_RELEASE_PASSWORD')\n        }\n    }\n    buildTypes {",
        1,
    )
text = text.replace("signingConfig signingConfigs.debug\n            def enableShrinkResources", "signingConfig signingConfigs.release\n            def enableShrinkResources", 1)
path.write_text(text)
PY

cd "$PROJECT_DIR/android"
SWITCHPORTS_RELEASE_PASSWORD="$SWITCHPORTS_RELEASE_PASSWORD" NODE_ENV=production ./gradlew assembleRelease

mkdir -p "$PROJECT_DIR/artifacts"
cp -f "$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk" "$PROJECT_DIR/artifacts/SwitchPorts-release.apk"
printf '\nAPK release criado em: %s\n' "$PROJECT_DIR/artifacts/SwitchPorts-release.apk"
ls -lh "$PROJECT_DIR/artifacts/SwitchPorts-release.apk"
sha256sum "$PROJECT_DIR/artifacts/SwitchPorts-release.apk"
