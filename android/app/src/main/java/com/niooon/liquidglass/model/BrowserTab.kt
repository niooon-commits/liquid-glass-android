package com.niooon.liquidglass.model

data class BrowserTab(
    val id: String,
    val url: String = "",
    val title: String = "New Tab",
    val domain: String = "google.com",
    val isHome: Boolean = true,
    val canGoBack: Boolean = false,
    val canGoForward: Boolean = false,
    val blockedAdCount: Int = 0
)

enum class ScreenMode {
    HOME,
    WEB_VIEW,
    TABS_OVERVIEW
}
