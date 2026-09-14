package com.niooon.liquidglass.ui.screens

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.niooon.liquidglass.chromium.ChromiumAdBlocker
import com.niooon.liquidglass.chromium.ChromiumContentShell
import com.niooon.liquidglass.chromium.ChromiumEngineManager
import com.niooon.liquidglass.model.BrowserTab
import com.niooon.liquidglass.ui.components.BrowserTopBar
import com.niooon.liquidglass.ui.components.ChromiumInfoDialog
import com.niooon.liquidglass.ui.components.ChromiumShieldDialog
import com.niooon.liquidglass.utils.UrlUtils

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun LiquidWebScreen(
    tab: BrowserTab,
    tabCount: Int,
    onHomeClick: () -> Unit,
    onNewTabClick: () -> Unit,
    onTabsOverviewClick: () -> Unit,
    onCloseTabClick: () -> Unit,
    onTabUpdated: (BrowserTab) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current

    val currentTab by rememberUpdatedState(tab)
    val currentOnTabUpdated by rememberUpdatedState(onTabUpdated)

    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var currentUrl by remember(tab.id) { mutableStateOf(tab.url) }
    var currentDomain by remember(tab.id) { mutableStateOf(tab.domain) }
    var pageTitle by remember(tab.id) { mutableStateOf(tab.title) }
    var lastLoadedUrl by remember(tab.id) { mutableStateOf("") }
    var localBlockedCount by remember(tab.id) { mutableIntStateOf(tab.blockedAdCount) }
    var canGoBack by remember { mutableStateOf(false) }
    var canGoForward by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(true) }
    var progressFloat by remember { mutableFloatStateOf(0f) }
    var isDesktopMode by remember { mutableStateOf(false) }
    var showChromiumInfo by remember { mutableStateOf(false) }
    var showShieldDialog by remember { mutableStateOf(false) }
    var customFullscreenView by remember { mutableStateOf<View?>(null) }
    var customViewCallback by remember { mutableStateOf<WebChromeClient.CustomViewCallback?>(null) }

    // Initialize Chromium Safe Browsing and persistent cookies
    LaunchedEffect(Unit) {
        ChromiumEngineManager.initializeChromium(context)
    }

    // Chromium Shield Dialog (Ad-Blocker & Tracker Protection)
    if (showShieldDialog) {
        ChromiumShieldDialog(
            tabId = tab.id,
            domain = currentDomain,
            onDismiss = { showShieldDialog = false },
            onReload = {
                webViewInstance?.reload()
            }
        )
    }

    // Chromium Engine & Content Shell Diagnostics Dialog
    if (showChromiumInfo) {
        ChromiumInfoDialog(
            onDismiss = { showChromiumInfo = false },
            onVisitChromiumOrg = {
                val target = "https://www.chromium.org/chromium-projects/"
                lastLoadedUrl = target
                currentUrl = target
                currentDomain = UrlUtils.extractDomain(target)
                webViewInstance?.loadUrl(target)
            }
        )
    }

    // Intercept hardware / gesture back navigation
    BackHandler(enabled = true) {
        if (customFullscreenView != null) {
            customViewCallback?.onCustomViewHidden()
            customFullscreenView = null
        } else if (webViewInstance?.canGoBack() == true) {
            webViewInstance?.goBack()
        } else {
            onHomeClick()
        }
    }

    // React to external URL changes only (not internal navigations or redirects)
    LaunchedEffect(tab.url) {
        if (tab.url.isNotBlank() && tab.url != lastLoadedUrl && tab.url != currentUrl) {
            lastLoadedUrl = tab.url
            currentUrl = tab.url
            currentDomain = UrlUtils.extractDomain(tab.url)
            webViewInstance?.loadUrl(tab.url)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Status bar area + Chrome Omnibox Top Bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFF1F5F9))
                .statusBarsPadding()
        ) {
            BrowserTopBar(
                domain = currentDomain,
                currentUrl = currentUrl,
                tabCount = tabCount,
                isDesktopMode = isDesktopMode,
                blockedAdCount = localBlockedCount,
                onHomeClick = onHomeClick,
                onSearchSubmit = { newQuery ->
                    val formatted = UrlUtils.formatInputToUrl(newQuery)
                    lastLoadedUrl = formatted
                    currentUrl = formatted
                    currentDomain = UrlUtils.extractDomain(formatted)
                    webViewInstance?.loadUrl(formatted)
                },
                onNewTabClick = onNewTabClick,
                onTabsOverviewClick = onTabsOverviewClick,
                onReloadClick = {
                    webViewInstance?.reload()
                },
                onCopyUrlClick = {
                    clipboardManager.setText(AnnotatedString(currentUrl))
                    Toast.makeText(context, "URL Copied: $currentUrl", Toast.LENGTH_SHORT).show()
                },
                onShareUrlClick = {
                    val sendIntent = Intent().apply {
                        action = Intent.ACTION_SEND
                        putExtra(Intent.EXTRA_TEXT, currentUrl)
                        type = "text/plain"
                    }
                    val shareIntent = Intent.createChooser(sendIntent, "Share Website")
                    context.startActivity(shareIntent)
                },
                onToggleDesktopMode = {
                    isDesktopMode = !isDesktopMode
                    webViewInstance?.let { wv ->
                        ChromiumEngineManager.applyChromiumSettings(wv, isDesktopMode)
                        wv.reload()
                    }
                },
                onCloseTabClick = onCloseTabClick,
                onOpenInCustomTab = {
                    ChromiumEngineManager.openInChromiumCustomTab(context, currentUrl)
                },
                onChromiumInfoClick = {
                    showChromiumInfo = true
                },
                onShieldClick = {
                    showShieldDialog = true
                }
            )
        }

        // Web Loading Progress Bar
        AnimatedVisibility(
            visible = isLoading && progressFloat < 1.0f,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            LinearProgressIndicator(
                progress = { progressFloat },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(2.5.dp),
                color = Color(0xFF0284C7),
                trackColor = Color(0xFFE0F2FE)
            )
        }

        // Web Content View Container
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    WebView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )

                        // 1. Apply Chromium WebSettings & User-Agent
                        ChromiumEngineManager.applyChromiumSettings(this, isDesktopMode)

                        // 2. Configure Official Chromium Content Shell Architecture
                        ChromiumContentShell.configureContentShell(ctx, this)

                        // 3. Chromium Network Interceptor (Ad-Blocker & Tracker Filter)
                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                super.onPageStarted(view, url, favicon)
                                isLoading = true
                                url?.let {
                                    lastLoadedUrl = it
                                    currentUrl = it
                                    currentDomain = UrlUtils.extractDomain(it)
                                }
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                isLoading = false
                                url?.let { finishedUrl ->
                                    lastLoadedUrl = finishedUrl
                                    currentUrl = finishedUrl
                                    currentDomain = UrlUtils.extractDomain(finishedUrl)
                                    val titleStr = view?.title?.takeIf { it.isNotBlank() } ?: currentDomain
                                    pageTitle = titleStr
                                    canGoBack = view?.canGoBack() ?: false
                                    canGoForward = view?.canGoForward() ?: false

                                    val currentBlocked = ChromiumAdBlocker.getBlockedCount(currentTab.id)
                                    localBlockedCount = currentBlocked

                                    // Inject Chromium Cosmetic Ad-Block Script
                                    if (ChromiumAdBlocker.isEnabled) {
                                        view?.evaluateJavascript(ChromiumAdBlocker.COSMETIC_AD_BLOCK_JS, null)
                                    }

                                    // Only notify parent when URL or title or navigation status actually changed
                                    if (currentTab.url != finishedUrl || currentTab.title != titleStr || currentTab.canGoBack != canGoBack || currentTab.canGoForward != canGoForward) {
                                        currentOnTabUpdated(
                                            currentTab.copy(
                                                url = finishedUrl,
                                                domain = currentDomain,
                                                title = titleStr,
                                                isHome = false,
                                                canGoBack = canGoBack,
                                                canGoForward = canGoForward,
                                                blockedAdCount = currentBlocked
                                            )
                                        )
                                    }
                                }
                            }

                            // Engine Socket-Level Request Interceptor
                            override fun shouldInterceptRequest(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): WebResourceResponse? {
                                // 1. Never block the main frame document
                                if (request == null || request.isForMainFrame) {
                                    return super.shouldInterceptRequest(view, request)
                                }

                                val reqUrl = request.url?.toString()
                                if (ChromiumAdBlocker.isEnabled && ChromiumAdBlocker.isAdOrTracker(reqUrl, currentDomain)) {
                                    ChromiumAdBlocker.recordBlockedRequest(currentTab.id)
                                    // Do NOT post state changes to parent here; this avoids infinite reload loops!
                                    return ChromiumAdBlocker.createBlockedResponse()
                                }
                                return super.shouldInterceptRequest(view, request)
                            }

                            override fun shouldOverrideUrlLoading(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): Boolean {
                                val reqUri = request?.url ?: return false
                                val scheme = reqUri.scheme?.lowercase() ?: ""

                                // Keep standard web navigation inside WebView
                                if (scheme == "http" || scheme == "https") {
                                    return false
                                }

                                // Safely handle custom deep-links (intent://, tel:, mailto:, etc.) without looping or crashing
                                return try {
                                    val intent = Intent.parseUri(reqUri.toString(), Intent.URI_INTENT_SCHEME)
                                    if (intent != null) {
                                        context.startActivity(intent)
                                        true
                                    } else {
                                        false
                                    }
                                } catch (_: Exception) {
                                    true
                                }
                            }
                        }

                        // 4. Content Shell WebChromeClient (HTML5 Video, DevTools, Progress)
                        webChromeClient = ChromiumContentShell.createContentShellChromeClient(
                            onProgress = { newProgress ->
                                progressFloat = (newProgress / 100f).coerceIn(0.05f, 1.0f)
                                if (newProgress >= 100) {
                                    isLoading = false
                                }
                            },
                            onTitleReceived = { title ->
                                if (title.isNotBlank() && title != pageTitle) {
                                    pageTitle = title
                                }
                            },
                            onShowCustomView = { view, callback ->
                                customFullscreenView = view
                                customViewCallback = callback
                            },
                            onHideCustomView = {
                                customFullscreenView = null
                                customViewCallback = null
                            }
                        )

                        // Load initial formatted URL
                        val target = if (currentTab.url.isNotBlank()) currentTab.url else "https://www.google.com"
                        lastLoadedUrl = target
                        currentUrl = target
                        currentDomain = UrlUtils.extractDomain(target)
                        loadUrl(target)
                        webViewInstance = this
                    }
                },
                update = { webView ->
                    webViewInstance = webView
                }
            )

            // HTML5 Fullscreen Video Overlay (YouTube, etc.)
            customFullscreenView?.let { fullscreenView ->
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = {
                        FrameLayout(it).apply {
                            addView(
                                fullscreenView,
                                ViewGroup.LayoutParams(
                                    ViewGroup.LayoutParams.MATCH_PARENT,
                                    ViewGroup.LayoutParams.MATCH_PARENT
                                )
                            )
                        }
                    }
                )
            }
        }

        // Bottom Web Action Bar (Navigation)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFF8FAFC))
                .border(width = 1.dp, color = Color(0xFFE2E8F0))
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Back Button
                IconButton(
                    onClick = {
                        if (webViewInstance?.canGoBack() == true) {
                            webViewInstance?.goBack()
                        } else {
                            onHomeClick()
                        }
                    },
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = if (canGoBack) Color(0xFF1E293B) else Color(0xFF94A3B8),
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Forward Button
                IconButton(
                    onClick = {
                        if (webViewInstance?.canGoForward() == true) {
                            webViewInstance?.goForward()
                        }
                    },
                    enabled = canGoForward,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = "Forward",
                        tint = if (canGoForward) Color(0xFF1E293B) else Color(0xFFCBD5E1),
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Home Button
                IconButton(
                    onClick = onHomeClick,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Home,
                        contentDescription = "Home",
                        tint = Color(0xFF1E293B),
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Refresh Button
                IconButton(
                    onClick = { webViewInstance?.reload() },
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Reload",
                        tint = Color(0xFF1E293B),
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Chrome Tabs Counter Button
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .clip(RoundedCornerShape(7.dp))
                        .background(Color.White)
                        .border(1.5.dp, Color(0xFF334155), RoundedCornerShape(7.dp))
                        .clickable { onTabsOverviewClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = tabCount.toString(),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF1E293B)
                    )
                }
            }
        }
    }
}
