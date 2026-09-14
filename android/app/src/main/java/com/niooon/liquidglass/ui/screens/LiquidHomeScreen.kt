package com.niooon.liquidglass.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.niooon.liquidglass.ui.components.DiscoverSection
import com.niooon.liquidglass.ui.components.GoogleLogoHeader
import com.niooon.liquidglass.ui.components.LiquidBottomBar
import com.niooon.liquidglass.ui.components.LiquidSearchBar
import com.niooon.liquidglass.ui.components.QuickAccessGrid
import kotlinx.coroutines.launch

@Composable
fun LiquidHomeScreen(
    tabCount: Int = 1,
    onSearch: (String) -> Unit = {},
    onOpenUrl: (String) -> Unit = {},
    onNewTab: () -> Unit = {},
    onTabsClick: () -> Unit = {},
    onMenuClick: () -> Unit = {}
) {
    val scrollState = rememberScrollState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Background Gradient with Refractive Sky and Fluid Bubbles
    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFFBFE1FF),
            Color(0xFFCEEAFF),
            Color(0xFFE5F4FF),
            Color(0xFFB5DCFF)
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = backgroundBrush)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
        ) {
            // Scrollable Content Area - strictly confined below status bar and above bottom bar
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(scrollState),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(14.dp))

                // 1. Google Multi-Color Logo & Profile Icon
                GoogleLogoHeader(
                    onProfileClick = {
                        scope.launch { snackbarHostState.showSnackbar("Logged in as Google Account") }
                    }
                )

                Spacer(modifier = Modifier.height(20.dp))

                // 2. Liquid Glass Pill Search Bar
                LiquidSearchBar(
                    onSearch = { query ->
                        if (query.isNotBlank()) {
                            onSearch(query)
                        }
                    },
                    onVoiceClick = {
                        scope.launch { snackbarHostState.showSnackbar("Listening to speech...") }
                    },
                    onLensClick = {
                        scope.launch { snackbarHostState.showSnackbar("Opening Google Lens camera...") }
                    }
                )

                Spacer(modifier = Modifier.height(28.dp))

                // 3. Quick Access Grid (YouTube, Instagram, Facebook, WhatsApp, etc.)
                QuickAccessGrid(
                    onItemClick = { item ->
                        if (item.id == "add") {
                            scope.launch { snackbarHostState.showSnackbar("Add shortcut dialog") }
                        } else if (item.url.isNotBlank()) {
                            onOpenUrl(item.url)
                        }
                    }
                )

                Spacer(modifier = Modifier.height(26.dp))

                // 4. Discover Section (Cards with Travel, AI, Space)
                DiscoverSection(
                    onSeeMoreClick = {
                        scope.launch { snackbarHostState.showSnackbar("Loading more discovery stories...") }
                    },
                    onArticleClick = { article ->
                        if (article.articleUrl.isNotBlank()) {
                            onOpenUrl(article.articleUrl)
                        }
                    }
                )

                Spacer(modifier = Modifier.height(20.dp))
            }

            // 5. Liquid Glass Bottom Navigation Bar
            LiquidBottomBar(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
                tabCount = tabCount,
                canGoBack = false,
                canGoForward = false,
                onBackClick = {},
                onForwardClick = {},
                onSearchClick = {
                    // Trigger new search focus
                },
                onTabsClick = onTabsClick,
                onMenuClick = onMenuClick
            )
        }

        // Snackbar Host positioned above bottom bar
        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 80.dp)
        )
    }
}
