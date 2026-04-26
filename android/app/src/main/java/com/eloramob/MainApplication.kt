package com.eloramob

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    try {
      Log.d("MainApplication", "Starting MainApplication onCreate")
      super.onCreate()
      
      Log.d("MainApplication", "Loading React Native")
      loadReactNative(this)
      
      Log.d("MainApplication", "MainApplication onCreate completed successfully")
    } catch (e: Exception) {
      Log.e("MainApplication", "Critical error in MainApplication onCreate", e)
      // Try to continue anyway
      try {
        super.onCreate()
      } catch (e2: Exception) {
        Log.e("MainApplication", "Failed to call super.onCreate()", e2)
      }
    }
  }
}
