const {
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const KOTLIN_SERVICE_CODE = `package com.stridesync.steptracker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class StepCounterForegroundService : Service(), SensorEventListener {

    private var sensorManager: SensorManager? = null
    private var stepSensor: Sensor? = null
    private lateinit var prefs: SharedPreferences

    private val CHANNEL_ID = "step_tracking_live"
    private val NOTIFICATION_ID = 1001
    private var lastUpdateTimeMs: Long = 0
    private var lastNotifiedSteps: Long = 0

    companion object {
        const val PREFS_NAME = "stridesync_step_tracker"
        const val KEY_DAY_BASELINE = "day_baseline"
        const val KEY_LAST_SENSOR_VALUE = "last_sensor_value"
        const val KEY_LAST_SAVED_DATE = "last_saved_date"
        const val KEY_STEPS_BEFORE_REBOOT = "steps_before_reboot"
        const val KEY_TODAY_STEPS = "today_steps"
        const val KEY_REBOOT_DETECTED = "reboot_detected"
        const val KEY_LISTENER_COUNT = "listener_count"
        const val KEY_DAILY_GOAL = "daily_goal"

        var isRunning: Boolean = false
        var activeListenerCount: Int = 0

        fun getTodayDate(): String {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            return sdf.format(Date())
        }
    }

    override fun onCreate() {
        super.onCreate()
        try {
            prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val sm = getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            if (sm == null) {
                stopSelf()
                return
            }
            sensorManager = sm
            stepSensor = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

            createNotificationChannel()
            startForegroundServiceNotification(getStoredTodaySteps())

            if (stepSensor != null) {
                sm.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_UI)
                activeListenerCount = 1
                prefs.edit().putInt(KEY_LISTENER_COUNT, 1).apply()
            }
            isRunning = true
        } catch (e: Exception) {
            e.printStackTrace()
            try { stopSelf() } catch (_: Exception) {}
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        try {
            val currentSteps = getStoredTodaySteps()
            startForegroundServiceNotification(currentSteps)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return START_STICKY
    }

    override fun onDestroy() {
        try {
            super.onDestroy()
            sensorManager?.unregisterListener(this)
            activeListenerCount = 0
            if (::prefs.isInitialized) {
                prefs.edit().putInt(KEY_LISTENER_COUNT, 0).apply()
            }
            isRunning = false
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No action needed for step counter accuracy
    }

    override fun onSensorChanged(event: SensorEvent?) {
        try {
            if (event == null || event.sensor.type != Sensor.TYPE_STEP_COUNTER || !::prefs.isInitialized) return

            val rawSensorValue = event.values[0].toLong()
            val now = System.currentTimeMillis()
            val todayStr = getTodayDate()

            var baseline = prefs.getLong(KEY_DAY_BASELINE, 0L)
            var lastSensorVal = prefs.getLong(KEY_LAST_SENSOR_VALUE, 0L)
            val savedDate = prefs.getString(KEY_LAST_SAVED_DATE, "") ?: ""
            var stepsBeforeReboot = prefs.getLong(KEY_STEPS_BEFORE_REBOOT, 0L)
            var todaySteps = prefs.getLong(KEY_TODAY_STEPS, 0L)

            // 1. Initial Launch
            if (baseline == 0L && lastSensorVal == 0L) {
                baseline = rawSensorValue
                lastSensorVal = rawSensorValue
                todaySteps = 0L
                stepsBeforeReboot = 0L

                prefs.edit()
                    .putLong(KEY_DAY_BASELINE, baseline)
                    .putLong(KEY_LAST_SENSOR_VALUE, lastSensorVal)
                    .putString(KEY_LAST_SAVED_DATE, todayStr)
                    .putLong(KEY_STEPS_BEFORE_REBOOT, 0L)
                    .putLong(KEY_TODAY_STEPS, 0L)
                    .putBoolean(KEY_REBOOT_DETECTED, false)
                    .apply()
                return
            }

            // 2. Midnight Rollover (new day)
            if (todayStr != savedDate) {
                baseline = rawSensorValue
                lastSensorVal = rawSensorValue
                todaySteps = 0L
                stepsBeforeReboot = 0L

                prefs.edit()
                    .putLong(KEY_DAY_BASELINE, baseline)
                    .putLong(KEY_LAST_SENSOR_VALUE, lastSensorVal)
                    .putString(KEY_LAST_SAVED_DATE, todayStr)
                    .putLong(KEY_STEPS_BEFORE_REBOOT, 0L)
                    .putLong(KEY_TODAY_STEPS, 0L)
                    .putBoolean(KEY_REBOOT_DETECTED, false)
                    .apply()

                updateNotification(0L)
                StepCounterModule.notifyStepUpdate(0L, rawSensorValue, baseline)
                return
            }

            // 3. Duplicate event: ignore
            if (rawSensorValue == lastSensorVal) {
                return
            }

            // 4. Device Reboot: sensor resets to zero / low value
            if (rawSensorValue < lastSensorVal) {
                // Check if minor jitter (out-of-order)
                if (lastSensorVal - rawSensorValue <= 2L && rawSensorValue > 0) {
                    return
                }

                // Reboot detected! Preserve steps counted prior to reboot
                val countedBeforeReboot = Math.max(0L, lastSensorVal - baseline)
                stepsBeforeReboot += countedBeforeReboot
                baseline = rawSensorValue
                lastSensorVal = rawSensorValue
                todaySteps = stepsBeforeReboot + (rawSensorValue - baseline)

                prefs.edit()
                    .putLong(KEY_STEPS_BEFORE_REBOOT, stepsBeforeReboot)
                    .putLong(KEY_DAY_BASELINE, baseline)
                    .putLong(KEY_LAST_SENSOR_VALUE, lastSensorVal)
                    .putLong(KEY_TODAY_STEPS, todaySteps)
                    .putBoolean(KEY_REBOOT_DETECTED, true)
                    .apply()

                updateNotification(todaySteps)
                StepCounterModule.notifyStepUpdate(todaySteps, rawSensorValue, baseline)
                return
            }

            // 5. Normal Increment with Jump-Clamp (> 5 steps/sec)
            val rawDelta = rawSensorValue - lastSensorVal
            val elapsedSec = Math.max(0.2, (now - lastUpdateTimeMs) / 1000.0)
            val maxAllowed = Math.ceil(elapsedSec * 5.0).toLong()

            if (rawDelta > maxAllowed && elapsedSec < 60) {
                // Clamp spike: adjust baseline forward
                val excess = rawDelta - maxAllowed
                baseline += excess
                prefs.edit().putLong(KEY_DAY_BASELINE, baseline).apply()
            }

            todaySteps = Math.max(todaySteps, (rawSensorValue - baseline) + stepsBeforeReboot)
            lastSensorVal = rawSensorValue
            lastUpdateTimeMs = now

            prefs.edit()
                .putLong(KEY_LAST_SENSOR_VALUE, lastSensorVal)
                .putLong(KEY_TODAY_STEPS, todaySteps)
                .apply()

            // Throttle notification updates (at most every 5s or 10+ steps)
            if (todaySteps - lastNotifiedSteps >= 10 || now - lastUpdateTimeMs >= 5000) {
                lastNotifiedSteps = todaySteps
                updateNotification(todaySteps)
            }

            StepCounterModule.notifyStepUpdate(todaySteps, rawSensorValue, baseline)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun getStoredTodaySteps(): Long {
        return if (::prefs.isInitialized) prefs.getLong(KEY_TODAY_STEPS, 0L) else 0L
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                val name = "Live Step Tracker"
                val descriptionText = "Displays real-time steps while app is running in background"
                val importance = NotificationManager.IMPORTANCE_LOW
                val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                    description = descriptionText
                    setShowBadge(false)
                    setSound(null, null)
                    enableVibration(false)
                }
                val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                notificationManager?.createNotificationChannel(channel)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun buildNotification(steps: Long): Notification? {
        return try {
            val goal = (if (::prefs.isInitialized) prefs.getLong(KEY_DAILY_GOAL, 10000L) else 10000L).coerceAtLeast(1000L)
            val percent = Math.min(100, ((steps * 100) / goal).toInt())
            val distanceKm = String.format(Locale.US, "%.2f", steps * 0.00075)
            val calories = (steps * 0.04).toInt()
            val activeMins = (steps / 100).toInt()

            val launchIntent = packageManager.getLaunchIntentForPackage(packageName) ?: Intent()
            val pendingIntent = PendingIntent.getActivity(
                this,
                0,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
            )

            val title = "%,d steps".format(steps)
            val body = "$distanceKm km  |  $calories kcal  |  $activeMins min"
            val progressText = "$percent% of %,d goal".format(goal)

            var smallIconRes = applicationInfo.icon
            val notifIconRes = resources.getIdentifier("notification_icon", "drawable", packageName)
            if (notifIconRes != 0) {
                smallIconRes = notifIconRes
            } else if (smallIconRes == 0) {
                smallIconRes = android.R.drawable.stat_notify_sync
            }

            NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(body)
                .setSubText(progressText)
                .setSmallIcon(smallIconRes)
                .setColor(0xFF10B981.toInt())
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setProgress(100, percent, false)
                .setContentIntent(pendingIntent)
                .build()
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun startForegroundServiceNotification(steps: Long) {
        try {
            val notification = buildNotification(steps) ?: return
            if (Build.VERSION.SDK_INT >= 34) {
                val hasPermission = ContextCompat.checkSelfPermission(
                    this,
                    android.Manifest.permission.ACTIVITY_RECOGNITION
                ) == PackageManager.PERMISSION_GRANTED

                if (hasPermission) {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH)
                } else {
                    try {
                        startForeground(NOTIFICATION_ID, notification)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        stopSelf()
                    }
                }
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            try { stopSelf() } catch (_: Exception) {}
        }
    }

    private fun updateNotification(steps: Long) {
        try {
            val notification = buildNotification(steps) ?: return
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            notificationManager?.notify(NOTIFICATION_ID, notification)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
`;

const KOTLIN_BOOT_RECEIVER_CODE = `package com.stridesync.steptracker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat

class BootCompletedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        try {
            val action = intent?.action ?: return
            if (Intent.ACTION_BOOT_COMPLETED == action ||
                Intent.ACTION_MY_PACKAGE_REPLACED == action ||
                "android.intent.action.QUICKBOOT_POWERON" == action) {

                if (Build.VERSION.SDK_INT >= 34) {
                    val hasPermission = ContextCompat.checkSelfPermission(
                        context,
                        android.Manifest.permission.ACTIVITY_RECOGNITION
                    ) == PackageManager.PERMISSION_GRANTED
                    if (!hasPermission) return
                }

                val serviceIntent = Intent(context, StepCounterForegroundService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
`;

const KOTLIN_MODULE_CODE = `package com.stridesync.steptracker

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class StepCounterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val prefs: SharedPreferences =
        reactContext.getSharedPreferences(StepCounterForegroundService.PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private var instance: StepCounterModule? = null

        fun notifyStepUpdate(todaySteps: Long, rawSensor: Long, baseline: Long) {
            instance?.let { module ->
                try {
                    val params = Arguments.createMap().apply {
                        putDouble("todaySteps", todaySteps.toDouble())
                        putDouble("rawSensor", rawSensor.toDouble())
                        putDouble("baseline", baseline.toDouble())
                        putDouble("timestamp", System.currentTimeMillis().toDouble())
                    }
                    module.sendEvent("onStepCountUpdated", params)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    init {
        instance = this
    }

    override fun getName(): String = "StepCounterModule"

    private fun sendEvent(eventName: String, params: Any?) {
        try {
            if (reactContext.hasActiveReactInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun startService(dailyGoal: Double, promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                val hasPermission = ContextCompat.checkSelfPermission(
                    reactContext,
                    android.Manifest.permission.ACTIVITY_RECOGNITION
                ) == PackageManager.PERMISSION_GRANTED

                if (!hasPermission) {
                    promise.resolve(false)
                    return
                }
            }

            prefs.edit().putLong(StepCounterForegroundService.KEY_DAILY_GOAL, dailyGoal.toLong()).apply()
            val intent = Intent(reactContext, StepCounterForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun stopService(promise: Promise) {
        try {
            val intent = Intent(reactContext, StepCounterForegroundService::class.java)
            reactContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getTodaySteps(promise: Promise) {
        try {
            val todaySteps = prefs.getLong(StepCounterForegroundService.KEY_TODAY_STEPS, 0L)
            val rawSensor = prefs.getLong(StepCounterForegroundService.KEY_LAST_SENSOR_VALUE, 0L)
            val baseline = prefs.getLong(StepCounterForegroundService.KEY_DAY_BASELINE, 0L)
            val savedDate = prefs.getString(StepCounterForegroundService.KEY_LAST_SAVED_DATE, "") ?: ""
            val rebootDetected = prefs.getBoolean(StepCounterForegroundService.KEY_REBOOT_DETECTED, false)

            val result = Arguments.createMap().apply {
                putDouble("todaySteps", todaySteps.toDouble())
                putDouble("rawSensor", rawSensor.toDouble())
                putDouble("baseline", baseline.toDouble())
                putString("lastSavedDate", savedDate)
                putBoolean("isServiceRunning", StepCounterForegroundService.isRunning)
                putBoolean("rebootDetected", rebootDetected)
                putInt("listenerCount", StepCounterForegroundService.activeListenerCount)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_STEPS_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getDebugInfo(promise: Promise) {
        try {
            val todaySteps = prefs.getLong(StepCounterForegroundService.KEY_TODAY_STEPS, 0L)
            val rawSensor = prefs.getLong(StepCounterForegroundService.KEY_LAST_SENSOR_VALUE, 0L)
            val baseline = prefs.getLong(StepCounterForegroundService.KEY_DAY_BASELINE, 0L)
            val stepsBeforeReboot = prefs.getLong(StepCounterForegroundService.KEY_STEPS_BEFORE_REBOOT, 0L)
            val rebootDetected = prefs.getBoolean(StepCounterForegroundService.KEY_REBOOT_DETECTED, false)
            val listenerCount = StepCounterForegroundService.activeListenerCount

            val result = Arguments.createMap().apply {
                putDouble("rawSensor", rawSensor.toDouble())
                putDouble("baseline", baseline.toDouble())
                putDouble("todaySteps", todaySteps.toDouble())
                putDouble("stepsBeforeReboot", stepsBeforeReboot.toDouble())
                putDouble("lastUpdateTime", System.currentTimeMillis().toDouble())
                putBoolean("isServiceRunning", StepCounterForegroundService.isRunning)
                putBoolean("rebootDetected", rebootDetected)
                putInt("listenerCount", if (listenerCount > 0) 1 else 0)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("DEBUG_INFO_ERROR", e.message)
        }
    }

    @ReactMethod
    fun addListener(type: String) {
        // Keep React Native event listener happy
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        // Keep React Native event listener happy
    }
}
`;

const KOTLIN_PACKAGE_CODE = `package com.stridesync.steptracker

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class StepCounterPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(StepCounterModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> {
        return emptyList()
    }
}
`;

function withStepCounterService(config) {
  // 1. Android Manifest permissions and service declaration
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure permissions
    const requiredPermissions = [
      'android.permission.ACTIVITY_RECOGNITION',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_HEALTH',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.WAKE_LOCK',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM',
    ];

    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    requiredPermissions.forEach((permissionName) => {
      const exists = androidManifest['uses-permission'].some(
        (p) => p.$['android:name'] === permissionName
      );
      if (!exists) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': permissionName },
        });
      }
    });

    // Ensure service and receiver inside <application>
    const app = androidManifest.application[0];
    if (!app.service) app.service = [];
    if (!app.receiver) app.receiver = [];

    const serviceExists = app.service.some(
      (s) => s.$['android:name'] === '.StepCounterForegroundService'
    );
    if (!serviceExists) {
      app.service.push({
        $: {
          'android:name': '.StepCounterForegroundService',
          'android:foregroundServiceType': 'health',
          'android:exported': 'false',
        },
      });
    }

    const receiverExists = app.receiver.some(
      (r) => r.$['android:name'] === '.BootCompletedReceiver'
    );
    if (!receiverExists) {
      app.receiver.push({
        $: {
          'android:name': '.BootCompletedReceiver',
          'android:exported': 'true',
          'android:enabled': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
              { $: { 'android:name': 'android.intent.action.MY_PACKAGE_REPLACED' } },
              { $: { 'android:name': 'android.intent.action.QUICKBOOT_POWERON' } },
            ],
          },
        ],
      });
    }

    return config;
  });

  // 2. Add build.gradle dependencies
  config = withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('androidx.work:work-runtime-ktx')) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{/,
        `dependencies {\n    implementation "androidx.work:work-runtime-ktx:2.9.0"`
      );
    }
    return config;
  });

  // 3. Write Kotlin files into Android project during prebuild
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const packageDir = path.join(
        projectRoot,
        'app',
        'src',
        'main',
        'java',
        'com',
        'stridesync',
        'steptracker'
      );

      fs.mkdirSync(packageDir, { recursive: true });

      fs.writeFileSync(
        path.join(packageDir, 'StepCounterForegroundService.kt'),
        KOTLIN_SERVICE_CODE,
        'utf-8'
      );
      fs.writeFileSync(
        path.join(packageDir, 'BootCompletedReceiver.kt'),
        KOTLIN_BOOT_RECEIVER_CODE,
        'utf-8'
      );
      fs.writeFileSync(
        path.join(packageDir, 'StepCounterModule.kt'),
        KOTLIN_MODULE_CODE,
        'utf-8'
      );
      fs.writeFileSync(
        path.join(packageDir, 'StepCounterPackage.kt'),
        KOTLIN_PACKAGE_CODE,
        'utf-8'
      );

      // Register StepCounterPackage in MainApplication.kt if needed
      const mainAppFile = path.join(packageDir, 'MainApplication.kt');
      if (fs.existsSync(mainAppFile)) {
        let mainAppContent = fs.readFileSync(mainAppFile, 'utf-8');
        if (!mainAppContent.includes('StepCounterPackage()')) {
          mainAppContent = mainAppContent.replace(
            /PackageList\(this\)\.packages\.apply\s*{/,
            `PackageList(this).packages.apply {\n            add(StepCounterPackage())`
          );
          fs.writeFileSync(mainAppFile, mainAppContent, 'utf-8');
        }
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withStepCounterService;
