package com.dualmark.studio;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

public class DualMarkFileProvider extends ContentProvider {
    public static final String AUTHORITY = "com.dualmark.studio.fileprovider";

    public static Uri getUriForFile(File file) {
        return Uri.parse("content://" + AUTHORITY + "/" + file.getName());
    }

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File cacheDir = getContext().getCacheDir();
        File file = new File(cacheDir, uri.getLastPathSegment());
        if (!file.exists()) {
            throw new FileNotFoundException("File not found: " + uri.getPath());
        }
        return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        File cacheDir = getContext().getCacheDir();
        File file = new File(cacheDir, uri.getLastPathSegment());
        MatrixCursor cursor = new MatrixCursor(new String[]{
            OpenableColumns.DISPLAY_NAME,
            OpenableColumns.SIZE
        });
        cursor.addRow(new Object[]{file.getName(), file.length()});
        return cursor;
    }

    @Override
    public String getType(Uri uri) {
        String path = uri.getPath();
        if (path != null && path.endsWith(".pdf")) return "application/pdf";
        if (path != null && path.endsWith(".png")) return "image/png";
        if (path != null && path.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) { return null; }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) { return 0; }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) { return 0; }
}
