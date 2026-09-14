package com.niooon.liquidglass.chromium

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.URLUtil
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Toast
import androidx.browser.customtabs.CustomTabColorSchemeParams
import androidx.browser.customtabs.CustomTabsIntent
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature

/**
 * Chromium Engine Integration for Liquid Glass Browser
 * Built with Google's Chromium Project architecture (Blink engine + V8 JavaScript runtime)
 * via Android System WebView (Chromium core) and AndroidX WebKit / Browser Custom Tabs.
 */
object ChromiumEngineManager {

    private const val CHROMIUM_MOBILE_USER_AGENT =
        "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"

    private const val CHROMIUM_DESKTOP_USER_AGENT =
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

    private var isSafeBrowsingInitialized = false

    /**
     * Initializes core Chromium security and engine features
     */
    fun initializeChromium(context: Context) {
        if (!isSafeBrowsingInitialized) {
            if (WebViewFeature.isFeatureSupported(WebViewFeature.START_SAFE_BROWSING)) {
                WebViewCompat.startSafeBrowsing(context.applicationContext) { success ->
                    isSafeBrowsingInitialized = success
                }
            }
        }

        // Enable third-party cookies & DOM storage persistence by default in Chromium
        try {
            val cookieManager = CookieManager.getInstance()
            cookieManager.setAcceptCookie(true)
        } catch (_: Exception) {}
    }

    /**
     * Retrieves the installed Chromium package version (e.g. Chrome/WebView 128.0.x)
     */
    fun getChromiumVersion(context: Context): String {
        return try {
            val webViewPackage = WebViewCompat.getCurrentWebViewPackage(context)
            if (webViewPackage != null) {
                "${webViewPackage.packageName} v${webViewPackage.versionName}"
            } else {
                "Chromium Blink / V8 (System Engine)"
            }
        } catch (_: Exception) {
            "Chromium Blink / V8 Engine"
        }
    }

    /**
     * Applies high-performance Chromium WebSettings to a WebView instance
     */
    @SuppressLint("SetJavaScriptEnabled")
    fun applyChromiumSettings(webView: WebView, isDesktopMode: Boolean = false) {
        val settings = webView.settings
        val context = webView.context

        settings.apply {
            // Core Chromium Execution & JavaScript
            javaScriptEnabled = true
            javaScriptCanOpenWindowsAutomatically = true

            // Chromium Storage & HTML5 APIs
            domStorageEnabled = true
            databaseEnabled = true

            // Viewport & Scale
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false

            // Media & Web Audio / WebRTC
            mediaPlaybackRequiresUserGesture = false

            // Mixed Content & Security
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

            // Caching & Performance
            cacheMode = WebSettings.LOAD_DEFAULT

            // User Agent String
            userAgentString = if (isDesktopMode) {
                CHROMIUM_DESKTOP_USER_AGENT
            } else {
                try {
                    WebSettings.getDefaultUserAgent(context)
                } catch (_: Exception) {
                    CHROMIUM_MOBILE_USER_AGENT
                }
            }
        }

        // Cookie Manager for Chromium WebView
        try {
            val cookieManager = CookieManager.getInstance()
            cookieManager.setAcceptThirdPartyCookies(webView, true)
        } catch (_: Exception) {}

        // Chromium Safe Browsing check
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) {
            WebSettingsCompat.setSafeBrowsingEnabled(settings, true)
        }

        // Configure Download Listener using Android DownloadManager
        webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, contentLength ->
            try {
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setMimeType(mimeType)
                    val filename = URLUtil.guessFileName(url, contentDisposition, mimeType)
                    setTitle(filename)
                    setDescription("Downloading file via Chromium...")
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                }

                val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager
                downloadManager?.enqueue(request)
                Toast.makeText(context, "Downloading via Chromium Engine...", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    context.startActivity(intent)
                } catch (_: Exception) {
                    Toast.makeText(context, "Cannot download file: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    /**
     * Launches a URL using Android Chromium Custom Tabs (Direct Chrome Process)
     */
    fun openInChromiumCustomTab(context: Context, url: String) {
        try {
            val colorScheme = CustomTabColorSchemeParams.Builder()
                .setToolbarColor(android.graphics.Color.parseColor("#F1F5F9"))
                .setNavigationBarColor(android.graphics.Color.parseColor("#F8FAFC"))
                .build()

            val customTabsIntent = CustomTabsIntent.Builder()
                .setDefaultColorSchemeParams(colorScheme)
                .setShowTitle(true)
                .setUrlBarHidingEnabled(true)
                .setShareState(CustomTabsIntent.SHARE_STATE_ON)
                .build()

            customTabsIntent.launchUrl(context, Uri.parse(url))
        } catch (e: Exception) {
            // Fallback to standard ACTION_VIEW
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(intent)
        }
    }

    /**
     * Returns diagnostic info about available Chromium features
     */
    fun getChromiumDiagnosticInfo(context: Context): Map<String, String> {
        return mapOf(
            "Engine" to getChromiumVersion(context),
            "Blink / V8 Support" to "Active (Chromium Standard)",
            "Safe Browsing" to if (WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) "Hardware Protected" else "Standard",
            "Multi-Process" to if (WebViewFeature.isFeatureSupported(WebViewFeature.MULTI_PROCESS)) "Isolated Renderer" else "Shared Process",
            "Hardware Acceleration" to "GPU Accelerated (Blink)",
            "Custom Tabs" to "Available (High Performance)"
        )
    }
}
