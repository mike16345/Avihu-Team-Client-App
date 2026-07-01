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
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.avihuteam.avihuteam.R
import java.time.Instant
import java.time.ZoneId
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class LiveStepsService : Service() {

    companion object {
        const val CHANNEL_ID = "avihu_team_live_steps"
        const val NOTIFICATION_ID = 1001

        private const val TITLE_TEXT = "צעדים שנעשו"
        private const val DISTANCE_TEXT = "מרחק: "
        private const val CHANNEL_NAME = "מעקב צעדים יומי"
        private const val CHANNEL_DESCRIPTION = "מציג את התקדמות הצעדים שלך לאורך היום"
        private const val GOAL_REACHED_TEXT = "✓"
        private const val POLL_INTERVAL_MS = 30_000L
        private const val STEP_DISTANCE_METERS = 0.762
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

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var pollingJob: Job? = null
    private var latestTodaySteps = 0
    private var latestDailyGoal = 0
    private var latestDistanceKm = 0.0

    override fun onCreate() {
        super.onCreate()
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                pollingJob?.cancel()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }

            else -> {
                latestTodaySteps = intent?.getIntExtra(EXTRA_TODAY_STEPS, latestTodaySteps) ?: latestTodaySteps
                latestDailyGoal = intent?.getIntExtra(EXTRA_DAILY_GOAL, latestDailyGoal) ?: latestDailyGoal
                latestDistanceKm =
                    intent?.getDoubleExtra(EXTRA_DISTANCE_KM, latestDistanceKm) ?: latestDistanceKm

                val notification = buildNotification(latestTodaySteps, latestDailyGoal, latestDistanceKm)
                startForeground(NOTIFICATION_ID, notification)
                startPollingIfNeeded()
            }
        }

        return START_STICKY
    }

    override fun onDestroy() {
        pollingJob?.cancel()
        serviceScope.cancel()
        super.onDestroy()
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

    private fun startPollingIfNeeded() {
        if (pollingJob?.isActive == true) {
            return
        }

        pollingJob = serviceScope.launch {
            while (isActive) {
                delay(POLL_INTERVAL_MS)
                refreshFromHealthConnect()
            }
        }
    }

    private suspend fun refreshFromHealthConnect() {
        try {
            val healthConnectClient = HealthConnectClient.getOrCreate(applicationContext)
            val zoneId = ZoneId.systemDefault()
            val startOfDay = java.time.LocalDate.now(zoneId).atStartOfDay(zoneId).toInstant()
            val now = Instant.now()
            val response = healthConnectClient.aggregate(
                AggregateRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(startOfDay, now)
                )
            )

            val nextTodaySteps = (response[StepsRecord.COUNT_TOTAL] ?: 0L).toInt()
            val nextDistanceKm = stepsToDistanceKm(nextTodaySteps)
            val hasChanged =
                nextTodaySteps != latestTodaySteps || nextDistanceKm != latestDistanceKm

            latestTodaySteps = nextTodaySteps
            latestDistanceKm = nextDistanceKm

            if (!hasChanged) {
                return
            }

            val notification = buildNotification(latestTodaySteps, latestDailyGoal, latestDistanceKm)
            val manager = getSystemService(NotificationManager::class.java)
            manager.notify(NOTIFICATION_ID, notification)
        } catch (err: Exception) {
            // Background reads can fail if Health Connect background access was not granted.
            // Keep the current notification state rather than stopping the foreground service.
        }
    }

    private fun buildNotification(todaySteps: Int, dailyGoal: Int, distanceKm: Double): Notification {
        val percent = if (dailyGoal > 0) {
            (todaySteps.toDouble() / dailyGoal * 100).toInt().coerceIn(0, 100)
        } else {
            0
        }

        val percentText = when {
            dailyGoal <= 0 -> ""
            todaySteps >= dailyGoal -> GOAL_REACHED_TEXT
            else -> "$percent%"
        }

        val compactSummary = buildStepsSummary(todaySteps, dailyGoal)
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

    private fun buildStepsSummary(todaySteps: Int, dailyGoal: Int): String {
        if (dailyGoal <= 0) {
            return formatSteps(todaySteps)
        }

        return "${formatSteps(dailyGoal)} / ${formatSteps(todaySteps)}"
    }

    private fun stepsToDistanceKm(steps: Int): Double =
        (steps.toDouble() * STEP_DISTANCE_METERS) / 1000.0
}
