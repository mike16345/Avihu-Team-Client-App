package com.avihuteam.avihuteam.livesteps

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import com.avihuteam.avihuteam.R

class LiveStepsService : Service() {

    companion object {
        const val CHANNEL_ID = "avihu_team_live_steps"
        const val NOTIFICATION_ID = 1001

        const val EXTRA_TODAY_STEPS = "todaySteps"
        const val EXTRA_DAILY_GOAL = "dailyGoal"
        const val EXTRA_DISTANCE_KM = "distanceKm"

        const val ACTION_START = "com.avihuteam.livesteps.START"
        const val ACTION_UPDATE = "com.avihuteam.livesteps.UPDATE"
        const val ACTION_STOP = "com.avihuteam.livesteps.STOP"

        fun buildStartIntent(context: Context, todaySteps: Int, dailyGoal: Int, distanceKm: Double): Intent =
            Intent(context, LiveStepsService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_TODAY_STEPS, todaySteps)
                putExtra(EXTRA_DAILY_GOAL, dailyGoal)
                putExtra(EXTRA_DISTANCE_KM, distanceKm)
            }

        fun buildUpdateIntent(context: Context, todaySteps: Int, dailyGoal: Int, distanceKm: Double): Intent =
            Intent(context, LiveStepsService::class.java).apply {
                action = ACTION_UPDATE
                putExtra(EXTRA_TODAY_STEPS, todaySteps)
                putExtra(EXTRA_DAILY_GOAL, dailyGoal)
                putExtra(EXTRA_DISTANCE_KM, distanceKm)
            }
    }

    override fun onCreate() {
        super.onCreate()
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            else -> {
                val todaySteps = intent?.getIntExtra(EXTRA_TODAY_STEPS, 0) ?: 0
                val dailyGoal = intent?.getIntExtra(EXTRA_DAILY_GOAL, 0) ?: 0
                val distanceKm = intent?.getDoubleExtra(EXTRA_DISTANCE_KM, 0.0) ?: 0.0

                val notification = buildNotification(todaySteps, dailyGoal, distanceKm)
                startForeground(NOTIFICATION_ID, notification)
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "מעקב צעדים יומי",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "מציג את התקדמות הצעדים שלך לאורך היום"
                setShowBadge(false)
                enableLights(false)
                enableVibration(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(todaySteps: Int, dailyGoal: Int, distanceKm: Double): Notification {
        val percent = if (dailyGoal > 0) {
            (todaySteps.toDouble() / dailyGoal * 100).toInt().coerceIn(0, 100)
        } else 0
        val goalReached = todaySteps >= dailyGoal && dailyGoal > 0

        val customView = RemoteViews(packageName, R.layout.live_steps_notification).apply {
            setTextViewText(R.id.stepsLabel, "צעדים שנעשו:")
            setTextViewText(R.id.stepsValue, formatSteps(todaySteps))
            setTextViewText(R.id.stepsGoal, " / מתוך ${formatSteps(dailyGoal)}")
            setTextViewText(R.id.distance, "מרחק קילומטר: ${"%.1f".format(distanceKm)}")
            setTextViewText(R.id.percentText, if (goalReached) "✓" else "$percent%")
            setProgressBar(R.id.ringProgress, 100, percent, false)
        }

        val openAppIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = openAppIntent?.let {
            PendingIntent.getActivity(
                this, 0, it,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setCustomContentView(customView)
            .setCustomBigContentView(customView)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun formatSteps(n: Int): String = "%,d".format(n)
}
