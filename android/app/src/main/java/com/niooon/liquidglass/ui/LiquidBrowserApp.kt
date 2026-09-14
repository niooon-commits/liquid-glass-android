package com.niooon.liquidglass.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.niooon.liquidglass.model.BrowserTab
import com.niooon.liquidglass.model.ScreenMode
import com.niooon.liquidglass.ui.screens.LiquidHomeScreen
import com.niooon.liquidglass.ui.screens.LiquidWebScreen
import com.niooon.liquidglass.ui.screens.TabsOverviewScreen
import com.niooon.liquidglass.utils.UrlUtils
import java.util.UUID

@Composable
fun LiquidBrowserApp() {
    var tabs by remember {
        mutableStateOf(
            listOf(
                BrowserTab(
                    id = UUID.randomUUID().toString(),
                    url = "",
                    title = "Google",
                    domain = "google.com",
                    isHome = true
                )
            )
        )
    }

    var activeTabId by remember {
        mutableStateOf(tabs.first().id)
    }

    var screenMode by remember {
        mutableStateOf(ScreenMode.HOME)
    }

    // Handlers
    val openUrl: (String) -> Unit = { input ->
        val formatted = UrlUtils.formatInputToUrl(input)
        val domain = UrlUtils.extractDomain(formatted)

        tabs = tabs.map { tab ->
            if (tab.id == activeTabId) {
                tab.copy(
                    url = formatted,
                    domain = domain,
                    title = domain,
                    isHome = false
                )
            } else tab
        }
        screenMode = ScreenMode.WEB_VIEW
    }

    val openNewTab: (String?) -> Unit = { url ->
        val newId = UUID.randomUUID().toString()
        val isHome = url.isNullOrBlank()
        val formatted = if (!isHome) UrlUtils.formatInputToUrl(url!!) else ""
        val domain = if (!isHome) UrlUtils.extractDomain(formatted) else "google.com"

        val newTab = BrowserTab(
            id = newId,
            url = formatted,
            title = if (isHome) "New Tab" else domain,
            domain = domain,
            isHome = isHome
        )
        tabs = tabs + newTab
        activeTabId = newId
        screenMode = if (isHome) ScreenMode.HOME else ScreenMode.WEB_VIEW
    }

    val closeTab: (String) -> Unit = { idToClose ->
        val remaining = tabs.filter { it.id != idToClose }
        if (remaining.isEmpty()) {
            val defaultId = UUID.randomUUID().toString()
            val defaultTab = BrowserTab(
                id = defaultId,
                url = "",
                title = "Google",
                domain = "google.com",
                isHome = true
            )
            tabs = listOf(defaultTab)
            activeTabId = defaultId
            screenMode = ScreenMode.HOME
        } else {
            tabs = remaining
            if (activeTabId == idToClose) {
                val nextTab = remaining.last()
                activeTabId = nextTab.id
                screenMode = if (nextTab.isHome) ScreenMode.HOME else ScreenMode.WEB_VIEW
            }
        }
    }

    val closeAllTabs: () -> Unit = {
        val defaultId = UUID.randomUUID().toString()
        val defaultTab = BrowserTab(
            id = defaultId,
            url = "",
            title = "Google",
            domain = "google.com",
            isHome = true
        )
        tabs = listOf(defaultTab)
        activeTabId = defaultId
        screenMode = ScreenMode.HOME
    }

    val selectTab: (String) -> Unit = { targetId ->
        activeTabId = targetId
        val tab = tabs.find { it.id == targetId }
        screenMode = if (tab?.isHome == true) ScreenMode.HOME else ScreenMode.WEB_VIEW
    }

    val activeTab = tabs.find { it.id == activeTabId } ?: tabs.first()

    when (screenMode) {
        ScreenMode.HOME -> {
            LiquidHomeScreen(
                tabCount = tabs.size,
                onSearch = { query -> openUrl(query) },
                onOpenUrl = { url -> openUrl(url) },
                onNewTab = { openNewTab(null) },
                onTabsClick = { screenMode = ScreenMode.TABS_OVERVIEW },
                onMenuClick = { screenMode = ScreenMode.TABS_OVERVIEW }
            )
        }

        ScreenMode.WEB_VIEW -> {
            key(activeTab.id) {
                LiquidWebScreen(
                    tab = activeTab,
                    tabCount = tabs.size,
                    onHomeClick = {
                        // Mark current tab as home or switch to home view
                        screenMode = ScreenMode.HOME
                    },
                    onNewTabClick = {
                        openNewTab(null)
                    },
                    onTabsOverviewClick = {
                        screenMode = ScreenMode.TABS_OVERVIEW
                    },
                    onCloseTabClick = {
                        closeTab(activeTab.id)
                    },
                    onTabUpdated = { updatedTab ->
                        tabs = tabs.map { if (it.id == updatedTab.id) updatedTab else it }
                    }
                )
            }
        }

        ScreenMode.TABS_OVERVIEW -> {
            TabsOverviewScreen(
                tabs = tabs,
                activeTabId = activeTabId,
                onSelectTab = { id -> selectTab(id) },
                onCloseTab = { id -> closeTab(id) },
                onCloseAllTabs = closeAllTabs,
                onNewTab = { openNewTab(null) },
                onBack = {
                    val current = tabs.find { it.id == activeTabId }
                    screenMode = if (current?.isHome == true) ScreenMode.HOME else ScreenMode.WEB_VIEW
                }
            )
        }
    }
}
