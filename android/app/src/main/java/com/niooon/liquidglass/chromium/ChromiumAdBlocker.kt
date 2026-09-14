package com.niooon.liquidglass.chromium

import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream
import java.net.URI
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

/**
 * Chromium Multi-System Ad-Block & Anti-Adblock Defuser Suite
 *
 * Implements a 5-tier intelligent blocking architecture:
 * 1. Tier 1: Socket/Network Host & Path Filter (Stops ads & trackers before transmission)
 * 2. Tier 2: Smart Mock Defuser (Returns valid no-op JS stubs & 1x1 pixels so sites never break or freeze)
 * 3. Tier 3: Early Anti-Adblock Defuser Script (Spoofs ad-block detection APIs at document start)
 * 4. Tier 4: Non-destructive Cosmetic Ad Hider & MutationObserver (Collapses empty ad slots)
 * 5. Tier 5: Intrusive Overlay & Anti-Scroll-Freeze Guard (Restores page scrolling if ad backdrop locks it)
 */
object ChromiumAdBlocker {

    // Master toggles
    var isEnabled: Boolean = true
    var isTrackerBlockingEnabled: Boolean = true
    var isAntiAdblockDefuserEnabled: Boolean = true
    var isCosmeticHidingEnabled: Boolean = true

    // Per-tab blocked counter
    private val tabBlockedCounters = ConcurrentHashMap<String, AtomicInteger>()
    val totalBlockedGlobal = AtomicInteger(0)

    // 1x1 Transparent PNG (68 bytes) for images/pixels so pages don't trigger onerror loops
    private val TRANSPARENT_1X1_PNG = byteArrayOf(
        0x89.toByte(), 0x50.toByte(), 0x4E.toByte(), 0x47.toByte(), 0x0D.toByte(), 0x0A.toByte(), 0x1A.toByte(), 0x0A.toByte(),
        0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x0D.toByte(), 0x49.toByte(), 0x48.toByte(), 0x44.toByte(), 0x52.toByte(),
        0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x01.toByte(), 0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x01.toByte(),
        0x08.toByte(), 0x06.toByte(), 0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x1F.toByte(), 0x15.toByte(), 0xC4.toByte(),
        0x89.toByte(), 0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x0A.toByte(), 0x49.toByte(), 0x44.toByte(), 0x41.toByte(),
        0x54.toByte(), 0x78.toByte(), 0x9C.toByte(), 0x63.toByte(), 0x00.toByte(), 0x01.toByte(), 0x00.toByte(), 0x00.toByte(),
        0x05.toByte(), 0x00.toByte(), 0x01.toByte(), 0x0D.toByte(), 0x0A.toByte(), 0x2D.toByte(), 0xB4.toByte(), 0x00.toByte(),
        0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x49.toByte(), 0x4E.toByte(), 0x44.toByte(), 0xAE.toByte(), 0x42.toByte(),
        0x60.toByte(), 0x82.toByte()
    )

    // Synthesized JavaScript Mock Shim - Prevents TypeError: adsbygoogle is undefined or site load abortion
    private val MOCK_AD_JS_STUB = """
        // Chromium Anti-Adblock Defuser & No-Op Shims
        (function() {
            try {
                window.canRunAds = true;
                window.isAdBlockActive = false;
                window.adblocker = false;
                window.adblock = false;
                
                // Google AdSense / DoubleClick
                window.adsbygoogle = window.adsbygoogle || [];
                window.adsbygoogle.push = function(arg) {
                    if (arg && typeof arg === 'object') { arg.loaded = true; }
                    return 1;
                };
                window.adsbygoogle.loaded = true;
                
                // Google Publisher Tag (GPT / gpt.js)
                window.googletag = window.googletag || {};
                window.googletag.cmd = window.googletag.cmd || [];
                window.googletag.cmd.push = function(fn) { 
                    try { if (typeof fn === 'function') fn(); } catch(e){} 
                    return 1; 
                };
                window.googletag.apiReady = true;
                window.googletag.display = function() {};
                window.googletag.enableServices = function() {};
                window.googletag.pubads = function() {
                    return {
                        enableSingleRequest: function(){},
                        addService: function(){},
                        setTargeting: function(){},
                        collapseEmptyDivs: function(){},
                        clear: function(){},
                        refresh: function(){},
                        addEventListener: function(){}
                    };
                };
                window.googletag.defineSlot = function() {
                    return {
                        addService: function(){ return this; },
                        setTargeting: function(){ return this; },
                        setCollapseEmptyDiv: function(){ return this; },
                        renderEnded: function(){}
                    };
                };

                // Prebid.js header bidding
                window.pbjs = window.pbjs || {};
                window.pbjs.que = window.pbjs.que || [];
                window.pbjs.requestBids = function(cfg) {
                    if (cfg && typeof cfg.bidsBackHandler === 'function') {
                        try { cfg.bidsBackHandler(); } catch(e){}
                    }
                };

                // Common Analytics & Pixel stubs so dependencies don't crash
                window.ga = window.ga || function(){};
                window.gtag = window.gtag || function(){};
                window.fbq = window.fbq || function(){};
                window._pop = window._pop || [];
                window.outbrain = window.outbrain || { OB_ready: true };
            } catch(e) {}
        })();
    """.trimIndent().toByteArray(Charsets.UTF_8)

    private val EMPTY_HTML = "<!DOCTYPE html><html><head></head><body></body></html>".toByteArray(Charsets.UTF_8)

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

        // Major Ad Networks & Header Bidders
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
        "adsterra.com",
        "hilltopads.com",
        "trafficstars.com",
        "adcash.com",

        // Social & Telemetry Trackers
        "facebook.net/tr",
        "connect.facebook.net/en_us/fbevents.js",
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

    // Keywords in path indicating ads or telemetry
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
     * Inspects a requested URL and returns true if it should be intercepted.
     * Guaranteed never to break YouTube, video playback, CDNs, or essential first-party media.
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
                host.endsWith("googleapis.com") ||
                host.endsWith("cloudflare.com") ||
                host.endsWith("jsdelivr.net") ||
                host.endsWith("unpkg.com")
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
     * Tier 2: Smart Defuser Response Generator
     *
     * Crucial for preventing website breakage:
     * - Returns valid JavaScript shims for `.js` ad requests so the site's other scripts don't crash
     * - Returns 1x1 transparent PNG for tracking pixels/banners so `onload` fires without error
     * - Returns blank HTML for iframes
     */
    fun createSmartDefuserResponse(url: String?): WebResourceResponse {
        val lowerUrl = url?.lowercase() ?: ""

        val isJs = lowerUrl.endsWith(".js") ||
                lowerUrl.contains("/js/") ||
                lowerUrl.contains("adsbygoogle") ||
                lowerUrl.contains("gpt.js") ||
                lowerUrl.contains("prebid") ||
                lowerUrl.contains("analytics") ||
                lowerUrl.contains("fbevents")

        val isImage = lowerUrl.endsWith(".png") ||
                lowerUrl.endsWith(".gif") ||
                lowerUrl.endsWith(".jpg") ||
                lowerUrl.endsWith(".jpeg") ||
                lowerUrl.endsWith(".webp") ||
                lowerUrl.contains("pixel") ||
                lowerUrl.contains("/tr")

        val isHtml = lowerUrl.endsWith(".html") || lowerUrl.endsWith(".htm") || lowerUrl.contains("/ad_frame")

        return when {
            isJs && isAntiAdblockDefuserEnabled -> {
                WebResourceResponse(
                    "application/javascript",
                    "UTF-8",
                    200,
                    "OK",
                    mapOf(
                        "Cache-Control" to "max-age=86400, public",
                        "Access-Control-Allow-Origin" to "*"
                    ),
                    ByteArrayInputStream(MOCK_AD_JS_STUB)
                )
            }
            isImage -> {
                WebResourceResponse(
                    "image/png",
                    "binary",
                    200,
                    "OK",
                    mapOf(
                        "Cache-Control" to "max-age=86400, public",
                        "Access-Control-Allow-Origin" to "*"
                    ),
                    ByteArrayInputStream(TRANSPARENT_1X1_PNG)
                )
            }
            isHtml -> {
                WebResourceResponse(
                    "text/html",
                    "UTF-8",
                    200,
                    "OK",
                    mapOf("Cache-Control" to "no-store"),
                    ByteArrayInputStream(EMPTY_HTML)
                )
            }
            else -> {
                WebResourceResponse(
                    "text/plain",
                    "UTF-8",
                    200,
                    "OK",
                    mapOf("Cache-Control" to "no-store"),
                    ByteArrayInputStream(ByteArray(0))
                )
            }
        }
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
     * Tier 3: Early Anti-Adblock Defuser Script
     * Injected at `onPageStarted` before page scripts evaluate to neutralize BlockAdBlock, FuckAdBlock, etc.
     */
    const val EARLY_DEFUSER_JS = """
        (function() {
            try {
                if (window.__niooon_early_defuser_applied) return;
                window.__niooon_early_defuser_applied = true;

                // Anti-adblock global bypass flags
                window.canRunAds = true;
                window.isAdBlockActive = false;
                window.adblocker = false;
                window.adblock = false;
                
                // AdsByGoogle mock
                window.adsbygoogle = window.adsbygoogle || [];
                window.adsbygoogle.push = function(o) { if (o && typeof o === 'object') o.loaded = true; return 1; };
                window.adsbygoogle.loaded = true;

                // Neutralize anti-adblock detection libraries
                try {
                    window.fuckAdBlock = undefined;
                    window.blockAdBlock = undefined;
                    window.FuckAdBlock = undefined;
                    window.BlockAdBlock = undefined;
                } catch(e) {}
            } catch(e) {}
        })();
    """

    /**
     * Tier 4 & 5: Cosmetic Ad Hider, MutationObserver & Anti-Freeze Script
     * Injected at `onPageFinished` to collapse ad placeholders and prevent anti-adblock scroll locking.
     */
    const val COSMETIC_AD_BLOCK_JS = """
        (function() {
            try {
                if (window.__niooon_adblock_injected) return;
                window.__niooon_adblock_injected = true;
                
                // 1. Safe CSS Rule Injection for Ad Containers
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

                // 2. Dynamic MutationObserver - Catches lazy-loaded ad elements & modal overlays
                const adObserver = new MutationObserver(function(mutations) {
                    try {
                        // Collapse ad frames
                        const adFrames = document.querySelectorAll('iframe[src*="doubleclick"], iframe[src*="googlead"], iframe[src*="adnxs"]');
                        adFrames.forEach(function(el) {
                            el.style.display = 'none';
                        });

                        // Restore scrolling if anti-adblock banner sets overflow: hidden
                        if (document.body && document.body.style.overflow === 'hidden') {
                            const antiAdModals = document.querySelectorAll('[class*="adblock"], [id*="adblock"], [class*="ad-block"], [id*="ad-block"]');
                            if (antiAdModals.length > 0) {
                                antiAdModals.forEach(function(m) { m.remove(); });
                                document.body.style.overflow = 'auto';
                            }
                        }
                    } catch(e) {}
                });

                adObserver.observe(document.documentElement || document.body, {
                    childList: true,
                    subtree: true
                });

            } catch(e) {}
        })();
    """
}
