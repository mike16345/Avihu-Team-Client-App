package com.avihuteam.avihuteam.livesteps

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LiveStepsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val androidActivityId = "android_live_steps_service"

    override fun getName(): String = "RNLiveSteps"

    @ReactMethod
    fun start(todaySteps: Int, dailyGoal: Int, distanceKm: Double, promise: Promise) {
        try {
            val intent = LiveStepsService.buildStartIntent(
                reactApplicationContext, todaySteps, dailyGoal, distanceKm
            )
            startService(intent)
            promise.resolve(androidActivityId)
        } catch (e: Exception) {
            promise.reject("E_START", e.message, e)
        }
    }

    @ReactMethod
    fun update(activityId: String, todaySteps: Int, dailyGoal: Int, distanceKm: Double, promise: Promise) {
        try {
            val intent = LiveStepsService.buildUpdateIntent(
                reactApplicationContext, todaySteps, dailyGoal, distanceKm
            )
            startService(intent)
            promise.resolve(activityId)
        } catch (e: Exception) {
            promise.reject("E_UPDATE", e.message, e)
        }
    }

    @ReactMethod
    fun stop(activityId: String, promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, LiveStepsService::class.java).apply {
                action = LiveStepsService.ACTION_STOP
            }
            startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_STOP", e.message, e)
        }
    }

    @ReactMethod
    fun stopAll(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, LiveStepsService::class.java).apply {
                action = LiveStepsService.ACTION_STOP
            }
            startService(intent)
            promise.resolve(1)
        } catch (e: Exception) {
            promise.reject("E_STOP", e.message, e)
        }
    }

    @ReactMethod
    fun areActivitiesEnabled(promise: Promise) {
        // Android ongoing notifications are always supported on supported channels.
        promise.resolve(true)
    }

    private fun startService(intent: Intent) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }
}
