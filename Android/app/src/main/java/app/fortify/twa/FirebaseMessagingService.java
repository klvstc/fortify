
package app.fortify.twa;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import com.google.firebase.messaging.RemoteMessage;

public class FirebaseMessagingService extends com.google.firebase.messaging.FirebaseMessagingService {
    private static final String TAG = "FCMService";

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "New FCM Token received: " + token);
        // Save the token to SharedPreferences so the LauncherActivity can pick it up on next launch.
        SharedPreferences sharedPref = getSharedPreferences(AppConstants.FCM_TOKEN_PREFS, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(AppConstants.FCM_TOKEN_KEY, token);
        editor.apply();
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // This is where you would handle notifications that arrive while the app is in the foreground.
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
        }

        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }
    }
}
