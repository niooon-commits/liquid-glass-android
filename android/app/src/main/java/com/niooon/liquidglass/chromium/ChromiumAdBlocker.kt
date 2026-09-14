package com.niooon.liquidglass.chromium

import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream
import java.net.URI
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

/**
 * Chromium-level Ad-Blocker & Tracker Blocker Engine
 * Intercepts network requests at the socket/WebResource level and drops malicious,
 * tracking, and advertising requests before transmission.
 */
object ChromiumAdBlocker {

    var isEnabled: Boolean = true
    var isTrackerBlockingEnabled: Boolean = true

    // Per-tab blocked counter
    private val tabBlockedCounters = ConcurrentHashMap<String, AtomicInteger>()
    val totalBlockedGlobal = AtomicInteger(0)

    // Extensive list of ad networks and tracking domains
    private val KNOWN_AD_AND_TRACKER_DOMAINS = hashSetOf(
        // Google Ads & DoubleClick
        "doubleclick.net",
        "googleadservices.com",
        "googlesyndication.com",
        "pagead2.googlesyndication.com",
        "adservice.google.com",
        "admob.com",
        "googleads.g.doubleclick.net",
        "stats.g.doubleclick.net",

        // Major Ad Networks
        "pubmatic.com",
        "criteo.com",
        "criteo.net",
        "scorecardresearch.com",
        "outbrain.com",
        "taboola.com",
        "adnxs.com",
        "rubiconproject.com",
        "adcolony.com",
        "flurry.com",
        "chartbeat.com",
        "popads.net",
        "popcash.net",
        "smartadserver.com",
        "moatads.com",
        "exponential.com",
        "adform.net",
        "amazon-adsystem.com",
        "adtech.de",
        "applovin.com",
        "unityads.unity3d.com",
        "inmobi.com",
        "vungle.com",
        "ironsrc.com",
        "bidswitch.net",
        "casale.com",
        "openx.net",
        "quantserve.com",
        "zedo.com",
        "yieldmo.com",
        "revcontent.com",
        "mgid.com",
        "adroll.com",
        "trafficjunky.com",
        "propellerads.com",
        "exoclick.com",

        // Social & Telemetry Trackers
        "facebook.net/tr",
        "connect.facebook.net",
        "analytics.twitter.com",
        "ads-twitter.com",
        "pixel.wp.com",
        "hotjar.com",
        "mouseflow.com",
        "crazyegg.com",
        "statcounter.com",
        "yandex.ru/metrika",
        "mc.yandex.ru",
        "segment.io",
        "branch.io",
        "mixpanel.com",
        "appsflyer.com"
    )

    // Keywords in path or parameters indicating ads or telemetry
    private val AD_URL_PATTERNS = listOf(
        "/adserver/",
        "/adservice.",
        "/pagead/",
        "/ads/ad_",
        "/tracking/pixel",
        "/telemetry/log",
        "/sponsored_post",
        "banner_ad",
        "ad_type=",
        "doubleclick",
        "google_ad"
    )

    /**
     * Inspects a requested URL and returns true if it should be blocked.
     * Guaranteed never to break YouTube, video playback, or essential first-party media.
     */
    fun isAdOrTracker(url: String?, currentDomain: String = ""): Boolean {
        if (!isEnabled || url.isNullOrBlank()) return false

        return try {
            val lowerUrl = url.lowercase()
            val uri = URI(lowerUrl)
            val host = uri.host ?: ""

            // Whitelist critical video streaming, audio, and player infrastructure
            if (host.endsWith("googlevideo.com") ||
                host.endsWith("ytimg.com") ||
                host == "youtube.com" || host.endsWith(".youtube.com") ||
                host == "youtu.be" ||
                host.endsWith("gstatic.com") ||
                host.endsWith("googleapis.com")
            ) {
                // Only drop standalone external ad domains, never video or player endpoints
                if (host.contains("doubleclick.net") || host.contains("googleadservices.com") || host.contains("googlesyndication.com")) {
                    return true
                }
                return false
            }

            // Whitelist first-party scripts and essential resources of the active site
            if (currentDomain.isNotBlank() && (host == currentDomain || host.endsWith(".$currentDomain"))) {
                if (!lowerUrl.contains("/adserver/") && !lowerUrl.contains("/ads/ad_")) {
                    return false
                }
            }

            // 1. Direct host check or subdomain match
            for (domain in KNOWN_AD_AND_TRACKER_DOMAINS) {
                if (domain.contains("/")) {
                    if (lowerUrl.contains(domain)) return true
                } else {
                    if (host == domain || host.endsWith(".$domain")) {
                        return true
                    }
                }
            }

            // 2. Pattern matching in path
            for (pattern in AD_URL_PATTERNS) {
                if (lowerUrl.contains(pattern)) {
                    return true
                }
            }

            false
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Creates an empty HTTP response to drop ad network requests instantly
     */
    fun createBlockedResponse(): WebResourceResponse {
        return WebResourceResponse(
            "text/plain",
            "UTF-8",
            200,
            "OK",
            mapOf("Cache-Control" to "no-store, must-revalidate"),
            ByteArrayInputStream(ByteArray(0))
        )
    }

    /**
     * Increments blocked ads for a given tab
     */
    fun recordBlockedRequest(tabId: String) {
        tabBlockedCounters.computeIfAbsent(tabId) { AtomicInteger(0) }.incrementAndGet()
        totalBlockedGlobal.incrementAndGet()
    }

    /**
     * Gets blocked count for a tab
     */
    fun getBlockedCount(tabId: String): Int {
        return tabBlockedCounters[tabId]?.get() ?: 0
    }

    /**
     * Resets count for a new navigation in tab
     */
    fun resetTabCount(tabId: String) {
        tabBlockedCounters[tabId]?.set(0)
    }

    /**
     * Cosmetic Ad-Hiding CSS Script injected into the DOM
     */
    const val COSMETIC_AD_BLOCK_JS = """
        (function() {
            try {
                if (window.__niooon_adblock_injected) return;
                window.__niooon_adblock_injected = true;
                
                const style = document.createElement('style');
                style.id = 'niooon-ad-blocker-style';
                style.textContent = `
                    .adsbygoogle, .ad-banner, .ad-container, .ad_slot,
                    [id^="google_ads"], [id*="sponsored_post"], [class*="sponsored-post"],
                    [class*="ad-box"], [class*="advertisement-slot"],
                    div[id*="taboola"], div[class*="taboola"],
                    div[id*="outbrain"], div[class*="outbrain"],
                    .trc_related_container, .trc_rbox_div,
                    iframe[src*="doubleclick.net"], iframe[src*="googlesyndication.com"],
                    iframe[src*="adnxs.com"] {
                        display: none !important;
                        visibility: hidden !important;
                        height: 0 !important;
                        width: 0 !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                `;
                (document.head || document.documentElement).appendChild(style);
            } catch(e) {}
        })();
    """
}
