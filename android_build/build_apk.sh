#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$DIR")"

echo "=== Building DualMark Studio Standalone Native Android APK ==="

ANDROID_JAR="/home/davidalujones/Android/Sdk/platforms/android-36/android.jar"
BUILD_TOOLS="/home/davidalujones/Android/Sdk/build-tools/36.1.0"
AAPT2="$BUILD_TOOLS/aapt2"
D8="$BUILD_TOOLS/d8"
ZIPALIGN="$BUILD_TOOLS/zipalign"
APKSIGNER="$BUILD_TOOLS/apksigner"

# 1. Sync web_app into android_build/assets/web_app
echo "[1/7] Syncing web assets into Android assets/..."
rm -rf "$DIR/assets"
mkdir -p "$DIR/assets/web_app"
cp -r "$ROOT_DIR/web_app/"* "$DIR/assets/web_app/"

# Clean build directory
rm -rf "$DIR/build"
mkdir -p "$DIR/build/compiled_res" "$DIR/build/gen" "$DIR/build/classes" "$DIR/build/dex"

# 2. Compile Resources with AAPT2
echo "[2/7] Compiling Android Resources with AAPT2..."
"$AAPT2" compile --dir "$DIR/res" -o "$DIR/build/compiled_res.zip"

# 3. Link Android Resources
echo "[3/7] Linking Android Resources..."
"$AAPT2" link "$DIR/build/compiled_res.zip" \
  -I "$ANDROID_JAR" \
  --manifest "$DIR/AndroidManifest.xml" \
  --java "$DIR/build/gen" \
  -o "$DIR/build/resources.apk" \
  --auto-add-overlay

# 4. Compile Java Sources
echo "[4/7] Compiling Java Sources..."
javac -encoding UTF-8 \
  -cp "$ANDROID_JAR" \
  -d "$DIR/build/classes" \
  $(find "$DIR/src" -name "*.java") \
  $(find "$DIR/build/gen" -name "*.java")

# 5. Convert Bytecode to DEX with D8
echo "[5/7] Converting Bytecode to DEX with D8..."
"$D8" --output "$DIR/build/dex" \
  --lib "$ANDROID_JAR" \
  $(find "$DIR/build/classes" -name "*.class")

# 6. Package & Align APK
echo "[6/7] Packaging and Aligning APK..."
cp "$DIR/build/resources.apk" "$DIR/build/unaligned.apk"
cd "$DIR/build/dex"
zip -u "$DIR/build/unaligned.apk" classes.dex
cd "$DIR"
zip -ur "$DIR/build/unaligned.apk" assets/

"$ZIPALIGN" -f -p 4 "$DIR/build/unaligned.apk" "$DIR/build/aligned.apk"

# 7. Sign APK
echo "[7/7] Signing APK..."
KEYSTORE="$DIR/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "Generating debug keystore..."
  keytool -genkey -v -keystore "$KEYSTORE" -alias dualmarkdebug -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass android -keypass android -dname "CN=DualMark Studio,O=DualMark,C=US"
fi

"$APKSIGNER" sign --ks "$KEYSTORE" --ks-pass pass:android --key-pass pass:android \
  --out "$DIR/DualMark_Studio.apk" "$DIR/build/aligned.apk"

cp "$DIR/DualMark_Studio.apk" "$ROOT_DIR/DualMark_Studio.apk"

echo "=== SUCCESS! Standalone Android APK created ==="
ls -lh "$DIR/DualMark_Studio.apk"
ls -lh "$ROOT_DIR/DualMark_Studio.apk"
