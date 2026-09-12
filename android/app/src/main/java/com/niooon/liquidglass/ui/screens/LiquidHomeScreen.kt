package com.niooon.liquidglass.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.niooon.liquidglass.ui.components.DiscoverSection
import com.niooon.liquidglass.ui.components.GoogleLogoHeader
import com.niooon.liquidglass.ui.components.LiquidBottomBar
import com.niooon.liquidglass.ui.components.LiquidSearchBar
import com.niooon.liquidglass.ui.components.QuickAccessGrid
import com.niooon.liquidglass.ui.theme.TextPrimary
import kotlinx.coroutines.launch

@Composable
fun LiquidHomeScreen() {
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

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            LiquidBottomBar(
                modifier = Modifier
                    .navigationBarsPadding()
                    .padding(bottom = 12.dp),
                tabCount = 1,
                onBackClick = {
                    scope.launch { snackbarHostState.showSnackbar("Navigated back") }
                },
                onForwardClick = {
                    scope.launch { snackbarHostState.showSnackbar("Navigated forward") }
                },
                onSearchClick = {
                    scope.launch { snackbarHostState.showSnackbar("Opening search...") }
                },
                onTabsClick = {
                    scope.launch { snackbarHostState.showSnackbar("1 active tab") }
                },
                onMenuClick = {
                    scope.launch { snackbarHostState.showSnackbar("Browser settings & history") }
                }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(brush = backgroundBrush)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .statusBarsPadding()
                    .padding(innerPadding),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(12.dp))

                // 1. Google Multi-Color Logo & Profile Icon
                GoogleLogoHeader(
                    onProfileClick = {
                        scope.launch { snackbarHostState.showSnackbar("Logged in as Google Account") }
                    }
                )

                Spacer(modifier = Modifier.height(18.dp))

                // 2. Liquid Glass Pill Search Bar
                LiquidSearchBar(
                    onSearch = { query ->
                        scope.launch { snackbarHostState.showSnackbar("Searching for: $query") }
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
                        scope.launch {
                            snackbarHostState.showSnackbar(
                                if (item.id == "add") "Add shortcut dialog" else "Opening ${item.title}"
                            )
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
                        scope.launch { snackbarHostState.showSnackbar("Opening article: ${article.title}") }
                    }
                )

                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}
