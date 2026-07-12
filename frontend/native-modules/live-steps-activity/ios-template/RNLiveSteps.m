#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNLiveSteps, NSObject)

RCT_EXTERN_METHOD(start:(nonnull NSNumber *)todaySteps
                  dailyGoal:(nonnull NSNumber *)dailyGoal
                  distanceKm:(nonnull NSNumber *)distanceKm
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(update:(NSString *)activityId
                  todaySteps:(nonnull NSNumber *)todaySteps
                  dailyGoal:(nonnull NSNumber *)dailyGoal
                  distanceKm:(nonnull NSNumber *)distanceKm
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(stop:(NSString *)activityId
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(stopAll:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(areActivitiesEnabled:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
