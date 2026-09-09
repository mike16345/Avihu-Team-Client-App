import ActivityKit
import Foundation
import React

@objc(RNLiveSteps)
final class RNLiveSteps: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool { false }

    @objc(start:dailyGoal:distanceKm:resolver:rejecter:)
    func start(todaySteps: NSNumber,
               dailyGoal: NSNumber,
               distanceKm: NSNumber,
               resolver: @escaping RCTPromiseResolveBlock,
               rejecter: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.1, *) else {
            rejecter("E_VERSION", "Live Activity requires iOS 16.1+", nil)
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            rejecter("E_DISABLED", "Live Activities are disabled in Settings", nil)
            return
        }

        do {
            let attrs = StepsActivityAttributes(trainerName: "__APP_DISPLAY_NAME__")
            let state = StepsActivityAttributes.ContentState(
                todaySteps: todaySteps.intValue,
                dailyGoal: dailyGoal.intValue,
                distanceKm: distanceKm.doubleValue,
                lastUpdated: Date()
            )
            let activity = try Activity.request(
                attributes: attrs,
                contentState: state,
                pushType: nil
            )
            resolver(activity.id)
        } catch {
            rejecter("E_START", error.localizedDescription, error)
        }
    }

    @objc(update:todaySteps:dailyGoal:distanceKm:resolver:rejecter:)
    func update(activityId: String,
                todaySteps: NSNumber,
                dailyGoal: NSNumber,
                distanceKm: NSNumber,
                resolver: @escaping RCTPromiseResolveBlock,
                rejecter: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.1, *) else {
            rejecter("E_VERSION", "Live Activity requires iOS 16.1+", nil)
            return
        }

        Task {
            let activity = Activity<StepsActivityAttributes>.activities
                .first(where: { $0.id == activityId })
            guard let activity else {
                rejecter("E_NOT_FOUND", "Activity \(activityId) not found", nil)
                return
            }
            let state = StepsActivityAttributes.ContentState(
                todaySteps: todaySteps.intValue,
                dailyGoal: dailyGoal.intValue,
                distanceKm: distanceKm.doubleValue,
                lastUpdated: Date()
            )
            await activity.update(using: state)
            resolver(activityId)
        }
    }

    @objc(stop:resolver:rejecter:)
    func stop(activityId: String,
              resolver: @escaping RCTPromiseResolveBlock,
              rejecter: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.1, *) else {
            rejecter("E_VERSION", "Live Activity requires iOS 16.1+", nil)
            return
        }

        Task {
            let activity = Activity<StepsActivityAttributes>.activities
                .first(where: { $0.id == activityId })
            guard let activity else {
                resolver(false)
                return
            }
            await activity.end(using: nil, dismissalPolicy: .immediate)
            resolver(true)
        }
    }

    @objc(stopAll:rejecter:)
    func stopAll(resolver: @escaping RCTPromiseResolveBlock,
                 rejecter: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.1, *) else {
            resolver(0)
            return
        }
        Task {
            let activities = Activity<StepsActivityAttributes>.activities
            for activity in activities {
                await activity.end(using: nil, dismissalPolicy: .immediate)
            }
            resolver(activities.count)
        }
    }

    @objc(areActivitiesEnabled:rejecter:)
    func areActivitiesEnabled(resolver: @escaping RCTPromiseResolveBlock,
                              rejecter: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.1, *) else {
            resolver(false)
            return
        }
        resolver(ActivityAuthorizationInfo().areActivitiesEnabled)
    }
}
