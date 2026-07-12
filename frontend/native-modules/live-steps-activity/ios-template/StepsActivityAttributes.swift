import ActivityKit
import Foundation

public struct StepsActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var todaySteps: Int
        public var dailyGoal: Int
        public var distanceKm: Double
        public var lastUpdated: Date

        public init(todaySteps: Int, dailyGoal: Int, distanceKm: Double, lastUpdated: Date) {
            self.todaySteps = todaySteps
            self.dailyGoal = dailyGoal
            self.distanceKm = distanceKm
            self.lastUpdated = lastUpdated
        }
    }

    public var trainerName: String

    public init(trainerName: String) {
        self.trainerName = trainerName
    }
}
