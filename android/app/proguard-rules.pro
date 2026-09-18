# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Expo & React Native - Optimized rules
-keep class expo.modules.** { <fields>; <methods>; }
-keep class com.facebook.react.** { <fields>; <methods>; }
-keep public class com.horcrux.svg.** { <fields>; <methods>; }
-keep class com.swmansion.reanimated.** { <fields>; <methods>; }
-keep class com.facebook.react.turbomodule.** { <fields>; <methods>; }

# Add any project specific keep options here:
