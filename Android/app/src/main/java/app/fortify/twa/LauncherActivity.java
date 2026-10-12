
package app.fortify.twa;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {

    private static final String TAG = "LauncherActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.O) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER_PORTRAIT);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
    }

    @Override
    protected Uri getLaunchingUrl() {
        Log.d(TAG, "getLaunchingUrl called.");
        // Get the original launch Url.
        Uri uri = super.getLaunchingUrl();

        // Get the token from SharedPreferences
        SharedPreferences sharedPref = getSharedPreferences(AppConstants.FCM_TOKEN_PREFS, Context.MODE_PRIVATE);
        String token = sharedPref.getString(AppConstants.FCM_TOKEN_KEY, null);

        Log.d(TAG, "Read token from SharedPreferences: " + (token == null ? "NULL" : token));

        if (token != null) {
            Log.d(TAG, "Token found. Appending to URL and clearing from SharedPreferences.");
            // Append the token as a query parameter
            uri = uri.buildUpon().appendQueryParameter("fcmToken", token).build();

            // Clear the token so it's only sent once
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.remove(AppConstants.FCM_TOKEN_KEY);
            editor.apply();
        } else {
            Log.d(TAG, "No token found in SharedPreferences.");
        }

        Log.d(TAG, "Final launching URL: " + uri.toString());
        return uri;
    }
}
