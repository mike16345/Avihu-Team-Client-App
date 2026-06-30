package com.avihuteam.avihuteam.livesteps

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import com.avihuteam.avihuteam.R

class LiveStepsService : Service() {

    companion object {
        const val CHANNEL_ID = "avihu_team_live_steps"
        const val NOTIFICATION_ID = 1001

        private const val TITLE_TEXT = "צעדים שנעשו"
        private const val DISTANCE_TEXT = "מרחק: "
        private const val CHANNEL_NAME = "מעקב צעדים יומי"
        private const val CHANNEL_DESCRIPTION =
            "מציג את התקדמות הצעדים שלך לאורך היום"
        private const val GOAL_REACHED_TEXT = "✓"

        const val EXTRA_TODAY_STEPS = "todaySteps"
        const val EXTRA_DAILY_GOAL = "dailyGoal"
        const val EXTRA_DISTANCE_KM = "distanceKm"

        const val ACTION_START = "com.avihuteam.livesteps.START"
        const val ACTION_UPDATE = "com.avihuteam.livesteps.UPDATE"
        const val ACTION_STOP = "com.avihuteam.livesteps.STOP"
        const val CARDIO_DEEP_LINK = "avihuteam://cardio?openCardio=true"

        fun buildStartIntent(
            context: Context,
            todaySteps: Int,
            dailyGoal: Int,
            distanceKm: Double
        ): Intent =
            Intent(context, LiveStepsService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_TODAY_STEPS, todaySteps)
                putExtra(EXTRA_DAILY_GOAL, dailyGoal)
                putExtra(EXTRA_DISTANCE_KM, distanceKm)
            }

        fun buildUpdateIntent(
            context: Context,
            todaySteps: Int,
            dailyGoal: Int,
            distanceKm: Double
        ): Intent =
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
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = CHANNEL_DESCRIPTION
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
        } else {
            0
        }

        val percentText = if (todaySteps >= dailyGoal && dailyGoal > 0) {
            GOAL_REACHED_TEXT
        } else {
            "$percent%"
        }

        val compactSummary = "${formatSteps(dailyGoal)} / ${formatSteps(todaySteps)}"
        val expandedSummary = compactSummary

        val compactView = RemoteViews(packageName, R.layout.live_steps_notification).apply {
            setTextViewText(R.id.compactSummary, compactSummary)
            setTextViewText(R.id.percentText, percentText)
            setProgressBar(R.id.ringProgress, 100, percent, false)
        }

        val expandedView = RemoteViews(packageName, R.layout.live_steps_notification_expanded).apply {
            setTextViewText(R.id.expandedTitle, TITLE_TEXT)
            setTextViewText(R.id.expandedSummary, expandedSummary)
            setTextViewText(R.id.distance, DISTANCE_TEXT + "%.1fkm".format(distanceKm))
            setTextViewText(R.id.percentTextExpanded, percentText)
            setProgressBar(R.id.ringProgressExpanded, 100, percent, false)
        }

        val openCardioIntent = Intent(Intent.ACTION_VIEW, Uri.parse(CARDIO_DEEP_LINK)).apply {
            setPackage(packageName)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openCardioIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setCustomContentView(compactView)
            .setCustomBigContentView(expandedView)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun formatSteps(value: Int): String = "%,d".format(value)
}