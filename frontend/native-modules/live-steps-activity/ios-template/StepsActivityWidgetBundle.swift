import SwiftUI
import WidgetKit

@main
struct StepsActivityWidgetBundle: WidgetBundle {
    var body: some Widget {
        if #available(iOS 16.1, *) {
            StepsActivityWidget()
        }
    }
}
