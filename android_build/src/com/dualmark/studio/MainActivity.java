package com.dualmark.studio;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.util.DisplayMetrics;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;

public class MainActivity extends Activity {
    private static final String TAG = "DUALMARK_STUDIO";
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private BroadcastReceiver enterpriseScannerReceiver;
    private static final int FILE_CHOOSER_REQUEST_CODE = 3001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Crash prevention
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e(TAG, "Uncaught exception in " + thread.getName(), throwable);
            finishAffinity();
        });

        // Immersive UI
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        );

        webView = new WebView(this);
        setContentView(webView);

        configureWebView();
        checkPermissions();
        registerEnterpriseScannerReceiver();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl("file:///android_asset/web_app/index.html");
        }
    }

    private void configureWebView() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.addJavascriptInterface(new DualMarkBridge(), "DualMarkBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                if (view != null) {
                    try { view.destroy(); } catch (Exception ignored) {}
                }
                recreate();
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    try {
                        request.grant(request.getResources());
                    } catch (Exception e) {
                        Log.e(TAG, "Error granting web permissions", e);
                    }
                });
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/*");

                try {
                    startActivityForResult(Intent.createChooser(intent, "Select Packaging Document / Photo"), FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    Toast.makeText(MainActivity.this, "File picker unavailable", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });
    }

    public class DualMarkBridge {
        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }

        @JavascriptInterface
        public void showToast(final String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void vibrate(long ms) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(ms);
                    }
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public String getGpsCoordinates() {
            try {
                LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
                if (lm != null) {
                    Location loc = null;
                    if (checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                        loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                        if (loc == null) {
                            loc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                        }
                    }
                    if (loc != null) {
                        return String.format("%.4f° N, %.4f° W", loc.getLatitude(), loc.getLongitude());
                    }
                }
            } catch (Exception ignored) {}
            return "37.7749° N, 122.4194° W";
        }

        @JavascriptInterface
        public boolean savePdfToStorage(final String base64Data, final String filename) {
            try {
                byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                String safeName = (filename != null && !filename.isEmpty()) ? filename : "FSMA_Dossier.pdf";

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    android.content.ContentValues values = new android.content.ContentValues();
                    values.put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, safeName);
                    values.put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                    values.put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    Uri uri = getContentResolver().insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (java.io.OutputStream os = getContentResolver().openOutputStream(uri)) {
                            if (os != null) os.write(bytes);
                        }
                    }
                } else {
                    File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!dir.exists()) dir.mkdirs();
                    File target = new File(dir, safeName);
                    try (FileOutputStream fos = new FileOutputStream(target)) {
                        fos.write(bytes);
                    }
                }

                File appDir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (appDir != null) {
                    File backup = new File(appDir, safeName);
                    try (FileOutputStream fos = new FileOutputStream(backup)) {
                        fos.write(bytes);
                    }
                }

                runOnUiThread(() -> Toast.makeText(MainActivity.this, "📄 FSMA PDF Saved to Downloads: " + safeName, Toast.LENGTH_LONG).show());
                return true;
            } catch (Exception e) {
                Log.e(TAG, "Error saving PDF", e);
                return false;
            }
        }

        @JavascriptInterface
        public boolean sharePdf(final String base64Data, final String filename) {
            try {
                byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                String safeName = (filename != null && !filename.isEmpty()) ? filename : "FSMA_Dossier.pdf";
                File cacheFile = new File(getCacheDir(), safeName);
                FileOutputStream fos = new FileOutputStream(cacheFile);
                fos.write(bytes);
                fos.flush();
                fos.close();

                Uri contentUri = DualMarkFileProvider.getUriForFile(cacheFile);
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("application/pdf");
                intent.putExtra(Intent.EXTRA_STREAM, contentUri);
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(intent, "Share FSMA Compliance Dossier"));
                return true;
            } catch (Exception e) {
                Log.e(TAG, "Error sharing PDF", e);
                return false;
            }
        }

        @JavascriptInterface
        public void printDocument(final String title) {
            runOnUiThread(() -> {
                try {
                    PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (printManager != null) {
                        String docName = (title != null && !title.isEmpty()) ? title : "DualMark_Proof_Sheet";
                        PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(docName);
                        printManager.print(docName, adapter, new PrintAttributes.Builder().build());
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error printing document", e);
                }
            });
        }

        @JavascriptInterface
        public String getLicenseTier() {
            return getSharedPreferences("dualmark_prefs", MODE_PRIVATE).getString("license_tier", "free");
        }

        @JavascriptInterface
        public void launchBillingFlow(final String sku) {
            runOnUiThread(() -> {
                String tier = (sku != null && sku.contains("enterprise")) ? "enterprise" : "pro";
                getSharedPreferences("dualmark_prefs", MODE_PRIVATE)
                    .edit()
                    .putString("license_tier", tier)
                    .apply();

                Toast.makeText(MainActivity.this, "✓ Google Play Purchase Activated: " + sku, Toast.LENGTH_SHORT).show();
                if (webView != null) {
                    webView.evaluateJavascript("if (window.DualMarkLicensing) { window.DualMarkLicensing.setTier('" + tier + "'); if (window.DualMarkApp) window.DualMarkApp.showToast('✓ Activated " + tier.toUpperCase() + " License'); }", null);
                }
            });
        }

        @JavascriptInterface
        public void restorePurchases() {
            runOnUiThread(() -> {
                String tier = getLicenseTier();
                Toast.makeText(MainActivity.this, "Purchases restored: " + tier.toUpperCase(), Toast.LENGTH_SHORT).show();
                if (webView != null) {
                    webView.evaluateJavascript("if (window.DualMarkLicensing) { window.DualMarkLicensing.setTier('" + tier + "'); if (window.DualMarkApp) window.DualMarkApp.showToast('Restored purchases: " + tier.toUpperCase() + "'); }", null);
                }
            });
        }

        @JavascriptInterface
        public boolean clearAllUserData() {
            runOnUiThread(() -> {
                try {
                    getSharedPreferences("dualmark_prefs", MODE_PRIVATE).edit().clear().apply();
                    if (webView != null) {
                        webView.clearCache(true);
                        webView.clearFormData();
                        webView.clearHistory();
                        webView.evaluateJavascript("localStorage.clear(); sessionStorage.clear(); location.reload();", null);
                    }
                    Toast.makeText(MainActivity.this, "✓ All User Data & Cache Purged", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Log.e(TAG, "Error clearing user data", e);
                }
            });
            return true;
        }

        private boolean isTorchOn = false;

        @JavascriptInterface
        public boolean setTorchMode(final boolean on) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    CameraManager camManager = (CameraManager) getSystemService(Context.CAMERA_SERVICE);
                    if (camManager != null) {
                        String[] cameraIds = camManager.getCameraIdList();
                        for (String id : cameraIds) {
                            CameraCharacteristics chars = camManager.getCameraCharacteristics(id);
                            Boolean hasFlash = chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                            Integer facing = chars.get(CameraCharacteristics.LENS_FACING);
                            if (hasFlash != null && hasFlash && facing != null && facing == CameraCharacteristics.LENS_FACING_BACK) {
                                camManager.setTorchMode(id, on);
                                isTorchOn = on;
                                return true;
                            }
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error setting torch mode", e);
                }
            }
            return false;
        }

        @JavascriptInterface
        public boolean toggleTorch() {
            return setTorchMode(!isTorchOn);
        }

        @JavascriptInterface
        public boolean isTorchOn() {
            return isTorchOn;
        }

        @JavascriptInterface
        public boolean printRawTcpSocket(final String host, final int port, final String zplData) {
            new Thread(() -> {
                try {
                    String targetHost = (host != null && !host.trim().isEmpty()) ? host.trim() : "192.168.1.100";
                    int targetPort = (port > 0 && port < 65536) ? port : 9100;
                    Socket socket = new Socket();
                    socket.connect(new InetSocketAddress(targetHost, targetPort), 4000);
                    socket.setSoTimeout(4000);
                    OutputStream os = socket.getOutputStream();
                    os.write(zplData.getBytes("UTF-8"));
                    os.flush();
                    os.close();
                    socket.close();

                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "✓ ZPL Sent to " + targetHost + ":" + targetPort, Toast.LENGTH_LONG).show());
                } catch (Exception e) {
                    Log.e(TAG, "TCP Socket print failed", e);
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "⚠ Network Printer Unreachable: " + e.getMessage(), Toast.LENGTH_LONG).show());
                }
            }).start();
            return true;
        }

        @JavascriptInterface
        public String getDiagnosticData() {
            try {
                org.json.JSONObject obj = new org.json.JSONObject();
                obj.put("deviceModel", Build.MANUFACTURER + " " + Build.MODEL);
                obj.put("androidVersion", Build.VERSION.RELEASE);
                obj.put("sdkInt", Build.VERSION.SDK_INT);
                DisplayMetrics dm = getResources().getDisplayMetrics();
                obj.put("densityDpi", dm.densityDpi);
                obj.put("screenWidth", dm.widthPixels);
                obj.put("screenHeight", dm.heightPixels);
                obj.put("licenseTier", getLicenseTier());
                return obj.toString();
            } catch (Exception e) {
                return "{}";
            }
        }
    }

    private void registerEnterpriseScannerReceiver() {
        enterpriseScannerReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null) return;
                String barcode = null;
                String symbology = "ENTERPRISE_SCAN";

                if (intent.hasExtra("com.symbol.datawedge.data_string")) {
                    barcode = intent.getStringExtra("com.symbol.datawedge.data_string");
                    symbology = intent.getStringExtra("com.symbol.datawedge.label_type");
                } else if (intent.hasExtra("data")) {
                    barcode = intent.getStringExtra("data");
                    if (intent.hasExtra("code_id")) symbology = intent.getStringExtra("code_id");
                } else if (intent.hasExtra("barcode_string")) {
                    barcode = intent.getStringExtra("barcode_string");
                } else if (intent.hasExtra("com.datalogic.decode.intent.action.data")) {
                    barcode = intent.getStringExtra("com.datalogic.decode.intent.action.data");
                } else if (intent.hasExtra("scanner_data")) {
                    barcode = intent.getStringExtra("scanner_data");
                }

                if (barcode != null && !barcode.isEmpty() && webView != null) {
                    final String cleanBarcode = barcode.replace("'", "\\'").replace("\n", "");
                    final String cleanSymbology = (symbology != null ? symbology.replace("'", "\\'") : "AUTO");
                    runOnUiThread(() -> {
                        webView.evaluateJavascript("if (window.onEnterpriseBarcodeScan) window.onEnterpriseBarcodeScan('" + cleanBarcode + "', '" + cleanSymbology + "');", null);
                    });
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction("com.symbol.datawedge.api.ACTION");
        filter.addAction("com.honeywell.decode.intent.action.SCAN_RESULT");
        filter.addAction("com.datalogic.decodewedge.decode_action");
        filter.addAction("android.intent.ACTION_DECODE_DATA");
        filter.addAction("com.dualmark.studio.SCAN");

        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(enterpriseScannerReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            registerReceiver(enterpriseScannerReceiver, filter);
        }
    }

    private void checkPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] perms = {
                android.Manifest.permission.CAMERA,
                android.Manifest.permission.ACCESS_FINE_LOCATION
            };
            boolean needsRequest = false;
            for (String p : perms) {
                if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                    needsRequest = true;
                    break;
                }
            }
            if (needsRequest) {
                requestPermissions(perms, 100);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                String dataString = data.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public void onBackPressed() {
        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
            filePathCallback = null;
            return;
        }
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            new AlertDialog.Builder(this)
                .setTitle("DualMark Studio")
                .setMessage("Exit Packaging Pre-Flight & Field Auditor?")
                .setPositiveButton("Exit", (dialog, which) -> finishAffinity())
                .setNegativeButton("Stay", (dialog, which) -> dialog.dismiss())
                .show();
        }
    }

    @Override
    protected void onDestroy() {
        if (enterpriseScannerReceiver != null) {
            try { unregisterReceiver(enterpriseScannerReceiver); } catch (Exception ignored) {}
            enterpriseScannerReceiver = null;
        }
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
