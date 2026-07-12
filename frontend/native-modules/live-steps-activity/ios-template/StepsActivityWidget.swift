import ActivityKit
import SwiftUI
import WidgetKit

// Color palette mirrored from frontend/src/components/WorkoutPlan/cardio/steps/stepsConstants.ts
extension Color {
    static let stepsGreenDark = Color(red: 0.18, green: 0.725, blue: 0.302)        // #2EB94D
    static let stepsRingGradStart = Color(red: 0.027, green: 0.153, blue: 0.137)    // #072723
    static let stepsRingGradEnd = Color(red: 0.624, green: 0.902, blue: 0.639)      // #9FE6A3
    static let stepsRingTrack = Color(red: 0.894, green: 0.906, blue: 0.929)        // #E4E7EC
    static let stepsCardBg = Color(red: 0.961, green: 0.961, blue: 0.969)           // #F5F5F7
    static let stepsTextPrimary = Color(red: 0.102, green: 0.114, blue: 0.141)      // #1A1D24
    static let stepsTextMuted = Color(red: 0.027, green: 0.153, blue: 0.137).opacity(0.55)
}

private func formatSteps(_ n: Int) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    formatter.locale = Locale(identifier: "he_IL")
    return formatter.string(from: NSNumber(value: n)) ?? "\(n)"
}

private func progressFraction(state: StepsActivityAttributes.ContentState) -> Double {
    guard state.dailyGoal > 0 else { return 0 }
    return min(Double(state.todaySteps) / Double(state.dailyGoal), 1.0)
}

private func progressPercent(state: StepsActivityAttributes.ContentState) -> Int {
    guard state.dailyGoal > 0 else { return 0 }
    let raw = Double(state.todaySteps) / Double(state.dailyGoal)
    return Int((raw * 100).rounded())
}

private let cardioDeepLink = URL(string: "avihuteam://cardio?openCardio=true")

@available(iOS 16.1, *)
public struct StepsActivityWidget: Widget {
    public init() {}

    public var body: some WidgetConfiguration {
        ActivityConfiguration(for: StepsActivityAttributes.self) { context in
            StepsLockScreenView(state: context.state)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(cardioDeepLink)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    StepsRing(state: context.state, size: 44, strokeWidth: 6)
                        .environment(\.layoutDirection, .rightToLeft)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(formatSteps(context.state.todaySteps))
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.stepsTextPrimary)
                        Text("/ מתוך \(formatSteps(context.state.dailyGoal))")
                            .font(.system(size: 12))
                            .foregroundColor(.stepsTextMuted)
                    }
                    .environment(\.layoutDirection, .rightToLeft)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("מרחק קילומטר: \(String(format: "%.1f", context.state.distanceKm))")
                        .font(.system(size: 13))
                        .foregroundColor(.stepsTextMuted)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                        .environment(\.layoutDirection, .rightToLeft)
                }
            } compactLeading: {
                Image(systemName: "figure.walk")
                    .foregroundColor(.stepsGreenDark)
            } compactTrailing: {
                Text("\(progressPercent(state: context.state))%")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.stepsTextPrimary)
            } minimal: {
                Text("\(progressPercent(state: context.state))%")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.stepsGreenDark)
            }
        }
    }
}

@available(iOS 16.1, *)
struct StepsLockScreenView: View {
    let state: StepsActivityAttributes.ContentState

    var body: some View {
        HStack(spacing: 14) {
            VStack(alignment: .trailing, spacing: 4) {
                HStack(alignment: .firstTextBaseline, spacing: 0) {
                    Text("צעדים שנעשו:")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.stepsTextMuted)
                        .padding(.trailing, 8)
                    Text(formatSteps(state.todaySteps))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.stepsTextPrimary)
                    Text(" / מתוך \(formatSteps(state.dailyGoal))")
                        .font(.system(size: 13))
                        .foregroundColor(.stepsTextMuted)
                }
                Text("מרחק קילומטר: \(String(format: "%.1f", state.distanceKm))")
                    .font(.system(size: 13))
                    .foregroundColor(.stepsTextMuted)
            }

            StepsRing(state: state, size: 72, strokeWidth: 9)
        }
        .padding(.vertical, 14)
        .padding(.horizontal, 18)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 18)
                .fill(Color.stepsCardBg.opacity(0.96))
        )
        .overlay(
            // Logo badge in top-right (visual RTL = leading edge of HStack)
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 5)
                        .fill(.white)
                        .frame(width: 22, height: 22)
                        .shadow(color: Color.stepsRingGradStart.opacity(0.2), radius: 3, x: 0, y: 2)
                    Text("A")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.stepsRingGradStart)
                }
                Spacer()
            }
            .padding(.top, 8)
            .padding(.leading, 8),
            alignment: .topLeading
        )
        .padding(.horizontal, 16)
    }
}

@available(iOS 16.1, *)
struct StepsRing: View {
    let state: StepsActivityAttributes.ContentState
    let size: CGFloat
    let strokeWidth: CGFloat

    private var progress: Double { progressFraction(state: state) }
    private var percent: Int { progressPercent(state: state) }
    private var goalReached: Bool { progress >= 1.0 }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.stepsRingTrack, lineWidth: strokeWidth)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    LinearGradient(
                        colors: [
                            .stepsRingGradStart,
                            .stepsGreenDark,
                            .stepsRingGradEnd
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))

            if goalReached {
                Text("✓")
                    .font(.system(size: size * 0.28, weight: .bold))
                    .foregroundColor(.stepsGreenDark)
            } else {
                Text("\(percent)%")
                    .font(.system(size: size * 0.21, weight: .bold))
                    .foregroundColor(.stepsTextPrimary)
            }
        }
        .frame(width: size, height: size)
    }
}
