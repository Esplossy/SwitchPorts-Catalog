#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/android-sdk}"
JAVA_HOME_DEFAULT="/usr/lib/jvm/java-17-openjdk-amd64"
COMMANDLINE_TOOLS_VERSION="${COMMANDLINE_TOOLS_VERSION:-11076708}"

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo é necessário para instalar o JDK no ambiente."
  exit 1
fi

sudo apt-get update -y
sudo apt-get install -y openjdk-17-jdk-headless unzip curl
export JAVA_HOME="${JAVA_HOME:-$JAVA_HOME_DEFAULT}"
export ANDROID_SDK_ROOT="$SDK_ROOT"
export ANDROID_HOME="$SDK_ROOT"
mkdir -p "$SDK_ROOT/cmdline-tools" "$HOME/.android"

if [ ! -x "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]; then
  archive="/tmp/android-commandlinetools-${COMMANDLINE_TOOLS_VERSION}.zip"
  curl -fL --retry 3 -o "$archive" "https://dl.google.com/android/repository/commandlinetools-linux-${COMMANDLINE_TOOLS_VERSION}_latest.zip"
  rm -rf "$SDK_ROOT/cmdline-tools/latest" "$SDK_ROOT/cmdline-tools/cmdline-tools"
  unzip -q "$archive" -d "$SDK_ROOT/cmdline-tools"
  mv "$SDK_ROOT/cmdline-tools/cmdline-tools" "$SDK_ROOT/cmdline-tools/latest"
fi

export PATH="$JAVA_HOME/bin:$SDK_ROOT/cmdline-tools/latest/bin:$SDK_ROOT/platform-tools:$PATH"
yes | sdkmanager --licenses >/tmp/android-licenses.log || true
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

if [ ! -f "$HOME/.android/debug.keystore" ]; then
  keytool -genkeypair -v \
    -keystore "$HOME/.android/debug.keystore" \
    -storepass android \
    -alias androiddebugkey \
    -keypass android \
    -dname "CN=Android Debug,O=Android,C=US" \
    -keyalg RSA -keysize 2048 -validity 10000
fi

cat > "$PROJECT_DIR/.android-build-env" <<EOF
export JAVA_HOME=$JAVA_HOME
export ANDROID_SDK_ROOT=$SDK_ROOT
export ANDROID_HOME=$SDK_ROOT
export PATH=\"\$JAVA_HOME/bin:\$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:\$ANDROID_SDK_ROOT/platform-tools:\$PATH\"
EOF

echo "Android debug environment ready."
echo "SDK: $SDK_ROOT"
echo "Keystore: $HOME/.android/debug.keystore"
