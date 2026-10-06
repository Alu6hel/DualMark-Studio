#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$DIR")"

echo "=== Building DualMark Studio Production Android App Bundle (.aab) ==="

ANDROID_JAR="/home/davidalujones/Android/Sdk/platforms/android-36/android.jar"
BUILD_TOOLS="/home/davidalujones/Android/Sdk/build-tools/36.1.0"
AAPT2="$BUILD_TOOLS/aapt2"
D8="$BUILD_TOOLS/d8"
BUNDLETOOL="$DIR/bundletool-all.jar"
KEYSTORE="$DIR/release.keystore"
STOREPASS="dualmark2026"
ALIAS="dualmark"

# 1. Sync web assets
echo "[1/8] Syncing web assets into Android assets/..."
rm -rf "$DIR/assets"
mkdir -p "$DIR/assets/web_app"
cp -r "$ROOT_DIR/web_app/"* "$DIR/assets/web_app/"

# 2. Compile Android Resources with AAPT2
echo "[2/8] Compiling Resources with AAPT2..."
mkdir -p "$DIR/build/compiled_res" "$DIR/build/gen" "$DIR/build/classes" "$DIR/build/dex"
"$AAPT2" compile --dir "$DIR/res" -o "$DIR/build/compiled_res.zip"

# 3. Link Resources in Proto Format for App Bundle
echo "[3/8] Linking Resources in Proto Format..."
"$AAPT2" link --proto-format "$DIR/build/compiled_res.zip" \
  -I "$ANDROID_JAR" \
  --manifest "$DIR/AndroidManifest.xml" \
  --java "$DIR/build/gen" \
  -o "$DIR/build/proto_res.apk" \
  --auto-add-overlay

# 4. Compile Java Sources
echo "[4/8] Compiling Java Sources..."
javac -encoding UTF-8 \
  -cp "$ANDROID_JAR" \
  -d "$DIR/build/classes" \
  $(find "$DIR/src" -name "*.java") \
  $(find "$DIR/build/gen" -name "*.java")

# 5. Convert Bytecode to DEX with D8
echo "[5/8] Converting Bytecode to DEX with D8..."
"$D8" --output "$DIR/build/dex" \
  --lib "$ANDROID_JAR" \
  $(find "$DIR/build/classes" -name "*.class")

# 6. Assemble Bundle Module Zip
echo "[6/8] Assembling Base Module Zip..."
rm -rf "$DIR/build/bundle_module"
mkdir -p "$DIR/build/bundle_module/manifest" "$DIR/build/bundle_module/dex" "$DIR/build/bundle_module/assets"

unzip -q "$DIR/build/proto_res.apk" -d "$DIR/build/bundle_module/"
mv "$DIR/build/bundle_module/AndroidManifest.xml" "$DIR/build/bundle_module/manifest/"
cp "$DIR/build/dex/classes.dex" "$DIR/build/bundle_module/dex/"
cp -r "$DIR/assets/"* "$DIR/build/bundle_module/assets/"

cd "$DIR/build/bundle_module"
zip -qr "$DIR/build/base.zip" *
cd "$DIR"

# 7. Build App Bundle with Bundletool
echo "[7/8] Generating Android App Bundle with Bundletool..."
java -jar "$BUNDLETOOL" build-bundle \
  --modules="$DIR/build/base.zip" \
  --output="$DIR/build/DualMark_Studio_unsigned.aab" \
  --overwrite

# 8. Sign App Bundle
echo "[8/8] Signing Android App Bundle with Release Keystore..."
cp "$DIR/build/DualMark_Studio_unsigned.aab" "$DIR/DualMark_Studio.aab"
jarsigner -keystore "$KEYSTORE" -storepass "$STOREPASS" -keypass "$STOREPASS" \
  "$DIR/DualMark_Studio.aab" "$ALIAS"

echo "Verifying Signed App Bundle..."
jarsigner -verify "$DIR/DualMark_Studio.aab"

cp "$DIR/DualMark_Studio.aab" "$ROOT_DIR/DualMark_Studio.aab"

echo "=== SUCCESS! Standalone Production Android App Bundle created ==="
ls -lh "$DIR/DualMark_Studio.aab"
ls -lh "$ROOT_DIR/DualMark_Studio.aab"
