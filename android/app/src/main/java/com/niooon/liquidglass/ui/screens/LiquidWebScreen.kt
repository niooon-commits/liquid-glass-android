package com.niooon.liquidglass.ui.screens

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
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
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.niooon.liquidglass.model.BrowserTab
import com.niooon.liquidglass.ui.components.BrowserTopBar
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

    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var currentUrl by remember { mutableStateOf(tab.url) }
    var currentDomain by remember { mutableStateOf(tab.domain) }
    var pageTitle by remember { mutableStateOf(tab.title) }
    var canGoBack by remember { mutableStateOf(false) }
    var canGoForward by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(true) }
    var progressFloat by remember { mutableFloatStateOf(0f) }
    var isDesktopMode by remember { mutableStateOf(false) }

    // Intercept hardware / gesture back navigation
    BackHandler(enabled = true) {
        if (webViewInstance?.canGoBack() == true) {
            webViewInstance?.goBack()
        } else {
            onHomeClick()
        }
    }

    // React to external URL changes (e.g. from tab change)
    LaunchedEffect(tab.url) {
        if (tab.url.isNotBlank() && tab.url != currentUrl) {
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
        // Status bar area + Chrome Top Bar
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
                onHomeClick = onHomeClick,
                onSearchSubmit = { newQuery ->
                    val formatted = UrlUtils.formatInputToUrl(newQuery)
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
                        val defaultAgent = WebSettings.getDefaultUserAgent(context)
                        val desktopAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                        wv.settings.userAgentString = if (isDesktopMode) desktopAgent else defaultAgent
                        wv.settings.useWideViewPort = isDesktopMode
                        wv.settings.loadWithOverviewMode = isDesktopMode
                        wv.reload()
                    }
                    Toast.makeText(
                        context,
                        if (isDesktopMode) "Switched to Desktop Site" else "Switched to Mobile Site",
                        Toast.LENGTH_SHORT
                    ).show()
                },
                onCloseTabClick = onCloseTabClick
            )
        }

        // Animated Web Page Loading Progress Indicator (Chrome-style slim blue line)
        AnimatedVisibility(
            visible = isLoading,
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

                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            databaseEnabled = true
                            loadWithOverviewMode = true
                            useWideViewPort = true
                            setSupportZoom(true)
                            builtInZoomControls = true
                            displayZoomControls = false
                            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                            cacheMode = WebSettings.LOAD_DEFAULT
                        }

                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                super.onPageStarted(view, url, favicon)
                                isLoading = true
                                url?.let {
                                    currentUrl = it
                                    currentDomain = UrlUtils.extractDomain(it)
                                }
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                isLoading = false
                                url?.let {
                                    currentUrl = it
                                    currentDomain = UrlUtils.extractDomain(it)
                                    val titleStr = view?.title ?: currentDomain
                                    pageTitle = titleStr
                                    canGoBack = view?.canGoBack() ?: false
                                    canGoForward = view?.canGoForward() ?: false

                                    // Update parent tab state
                                    onTabUpdated(
                                        tab.copy(
                                            url = it,
                                            domain = currentDomain,
                                            title = titleStr,
                                            isHome = false,
                                            canGoBack = canGoBack,
                                            canGoForward = canGoForward
                                        )
                                    )
                                }
                            }

                            override fun shouldOverrideUrlLoading(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): Boolean {
                                // Load inside our webview
                                return false
                            }
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                super.onProgressChanged(view, newProgress)
                                progressFloat = (newProgress / 100f).coerceIn(0.05f, 1.0f)
                                if (newProgress >= 100) {
                                    isLoading = false
                                }
                            }

                            override fun onReceivedTitle(view: WebView?, title: String?) {
                                super.onReceivedTitle(view, title)
                                title?.let {
                                    pageTitle = it
                                    onTabUpdated(tab.copy(title = it))
                                }
                            }
                        }

                        // Load initial formatted URL
                        val target = if (tab.url.isNotBlank()) tab.url else "https://www.google.com"
                        loadUrl(target)
                        webViewInstance = this
                    }
                },
                update = { webView ->
                    webViewInstance = webView
                }
            )
        }

        // Bottom Web Action Bar
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

                // Tabs Counter Button
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
