package com.niooon.liquidglass.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DesktopWindows
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.niooon.liquidglass.ui.theme.TextPrimary
import com.niooon.liquidglass.utils.UrlUtils

@Composable
fun BrowserTopBar(
    domain: String,
    currentUrl: String,
    tabCount: Int,
    isDesktopMode: Boolean,
    blockedAdCount: Int = 0,
    onHomeClick: () -> Unit,
    onSearchSubmit: (String) -> Unit,
    onNewTabClick: () -> Unit,
    onTabsOverviewClick: () -> Unit,
    onReloadClick: () -> Unit,
    onCopyUrlClick: () -> Unit,
    onShareUrlClick: () -> Unit,
    onToggleDesktopMode: () -> Unit,
    onCloseTabClick: () -> Unit,
    onOpenInCustomTab: () -> Unit = {},
    onChromiumInfoClick: () -> Unit = {},
    onShieldClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var isMenuExpanded by remember { mutableStateOf(false) }
    var isUrlEditOpen by remember { mutableStateOf(false) }
    var inputUrlText by remember { mutableStateOf(currentUrl) }

    // Popular suggestions for Chrome Omnibox
    val popularWebsites = remember {
        listOf(
            "google.com" to "Google Search",
            "youtube.com" to "YouTube",
            "wikipedia.org" to "Wikipedia",
            "github.com" to "GitHub",
            "reddit.com" to "Reddit",
            "twitter.com" to "X (Twitter)"
        )
    }

    // Google Chrome Omnibox Search / URL Editor Dialog
    if (isUrlEditOpen) {
        AlertDialog(
            onDismissRequest = { isUrlEditOpen = false },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = Color(0xFF0284C7),
                        modifier = Modifier.size(22.dp)
                    )
                    Text(
                        text = "Chromium Omnibox",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = TextPrimary
                    )
                }
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    // Omnibox Input Pill
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .clip(RoundedCornerShape(23.dp))
                            .background(Color(0xFFF1F5F9))
                            .border(1.5.dp, Color(0xFF0284C7), RoundedCornerShape(23.dp))
                            .padding(horizontal = 14.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            BasicTextField(
                                value = inputUrlText,
                                onValueChange = { inputUrlText = it },
                                modifier = Modifier.weight(1f),
                                singleLine = true,
                                textStyle = TextStyle(
                                    color = TextPrimary,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium
                                ),
                                cursorBrush = SolidColor(Color(0xFF0284C7)),
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Uri,
                                    imeAction = ImeAction.Go
                                ),
                                keyboardActions = KeyboardActions(
                                    onGo = {
                                        if (inputUrlText.isNotBlank()) {
                                            onSearchSubmit(inputUrlText)
                                            isUrlEditOpen = false
                                        }
                                    }
                                )
                            )

                            if (inputUrlText.isNotBlank()) {
                                IconButton(
                                    onClick = { inputUrlText = "" },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Clear",
                                        tint = Color(0xFF64748B),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Suggestions Header
                    Text(
                        text = if (inputUrlText.isBlank()) "Quick Access" else "Suggestions",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF64748B)
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                    ) {
                        if (inputUrlText.isNotBlank()) {
                            // Direct search action
                            item {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            onSearchSubmit(inputUrlText)
                                            isUrlEditOpen = false
                                        }
                                        .padding(vertical = 8.dp, horizontal = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Search,
                                        contentDescription = null,
                                        tint = Color(0xFF0284C7),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = "Search Google for \"$inputUrlText\"",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color(0xFF0284C7),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }

                        // Filtered suggestions
                        val filtered = popularWebsites.filter {
                            inputUrlText.isBlank() || it.first.contains(inputUrlText, ignoreCase = true) || it.second.contains(inputUrlText, ignoreCase = true)
                        }

                        items(filtered) { (siteUrl, siteName) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        onSearchSubmit("https://$siteUrl")
                                        isUrlEditOpen = false
                                    }
                                    .padding(vertical = 8.dp, horizontal = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Language,
                                    contentDescription = null,
                                    tint = Color(0xFF64748B),
                                    modifier = Modifier.size(18.dp)
                                )
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = siteName,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = siteUrl,
                                        fontSize = 11.sp,
                                        color = Color(0xFF94A3B8)
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (inputUrlText.isNotBlank()) {
                            onSearchSubmit(inputUrlText)
                            isUrlEditOpen = false
                        }
                    }
                ) {
                    Text("Go", fontWeight = FontWeight.Bold, color = Color(0xFF0284C7))
                }
            },
            dismissButton = {
                TextButton(onClick = { isUrlEditOpen = false }) {
                    Text("Cancel", color = Color(0xFF64748B))
                }
            },
            containerColor = Color.White,
            shape = RoundedCornerShape(24.dp)
        )
    }

    // Top Chrome-style Navigation & Omnibox Bar
    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFF8FAFC).copy(alpha = 0.98f),
                        Color(0xFFE2E8F0).copy(alpha = 0.95f)
                    )
                )
            )
            .border(
                width = 1.dp,
                color = Color.White.copy(alpha = 0.8f)
            )
            .padding(horizontal = 8.dp, vertical = 6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Home Icon Button
            IconButton(
                onClick = onHomeClick,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Home,
                    contentDescription = "Home",
                    tint = Color(0xFF334155),
                    modifier = Modifier.size(20.dp)
                )
            }

            // 1. Google Chrome Omnibox Capsule
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(38.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White.copy(alpha = 0.95f))
                    .border(
                        width = 1.dp,
                        color = Color(0xFFCBD5E1),
                        shape = RoundedCornerShape(20.dp)
                    )
                    .padding(horizontal = 8.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Security & Shield Icon (Clickable for AdBlock/Security Dialog)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onShieldClick() }
                            .padding(horizontal = 4.dp, vertical = 2.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                        ) {
                            Icon(
                                imageVector = if (blockedAdCount > 0) Icons.Default.Shield else Icons.Default.Lock,
                                contentDescription = "Security & Shield",
                                tint = if (blockedAdCount > 0) Color(0xFF0284C7) else Color(0xFF16A34A),
                                modifier = Modifier.size(14.dp)
                            )
                            if (blockedAdCount > 0) {
                                Text(
                                    text = blockedAdCount.toString(),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color(0xFF0284C7)
                                )
                            }
                        }
                    }

                    // Domain / URL Text (Tapping opens Omnibox input)
                    Text(
                        text = if (domain.isNotBlank()) domain else "Search or URL",
                        style = TextStyle(
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier
                            .weight(1f)
                            .clickable {
                                inputUrlText = if (currentUrl.isNotBlank()) currentUrl else domain
                                isUrlEditOpen = true
                            }
                    )

                    // Quick Reload Icon inside Omnibox
                    IconButton(
                        onClick = onReloadClick,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Reload",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }

            // 2. Plus Icon Button (+) to create a new tab
            IconButton(
                onClick = onNewTabClick,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.8f))
                    .border(1.dp, Color(0xFFE2E8F0), CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "New Tab",
                    tint = Color(0xFF0F172A),
                    modifier = Modifier.size(18.dp)
                )
            }

            // 3. Tab Counter Switcher Box ([N]) (Chrome for Android style)
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.White.copy(alpha = 0.9f))
                    .border(1.5.dp, Color(0xFF334155), RoundedCornerShape(8.dp))
                    .clickable { onTabsOverviewClick() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = tabCount.toString(),
                    style = TextStyle(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF1E293B)
                    )
                )
            }

            // 4. Three-Dot Menu Button (⋮)
            Box {
                IconButton(
                    onClick = { isMenuExpanded = true },
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "Menu",
                        tint = Color(0xFF334155),
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Dropdown Menu
                DropdownMenu(
                    expanded = isMenuExpanded,
                    onDismissRequest = { isMenuExpanded = false },
                    modifier = Modifier
                        .background(Color.White)
                        .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                ) {
                    DropdownMenuItem(
                        text = { Text("New Tab", fontSize = 14.sp) },
                        leadingIcon = {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onNewTabClick()
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Ad & Tracker Shield", fontSize = 14.sp, fontWeight = FontWeight.SemiBold) },
                        leadingIcon = {
                            Icon(Icons.Default.Shield, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onShieldClick()
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Reload", fontSize = 14.sp) },
                        leadingIcon = {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onReloadClick()
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Copy Link", fontSize = 14.sp) },
                        leadingIcon = {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onCopyUrlClick()
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Share", fontSize = 14.sp) },
                        leadingIcon = {
                            Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onShareUrlClick()
                        }
                    )

                    DropdownMenuItem(
                        text = {
                            Text(
                                text = if (isDesktopMode) "Mobile Site" else "Desktop Site",
                                fontSize = 14.sp
                            )
                        },
                        leadingIcon = {
                            Icon(Icons.Default.DesktopWindows, contentDescription = null, modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onToggleDesktopMode()
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Open in Chromium Tab", fontSize = 14.sp) },
                        leadingIcon = {
                            Icon(Icons.Default.OpenInBrowser, contentDescription = null, modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onOpenInCustomTab()
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Chromium Content Shell", fontSize = 14.sp) },
                        leadingIcon = {
                            Icon(Icons.Default.Info, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onChromiumInfoClick()
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Close Tab", fontSize = 14.sp, color = Color(0xFFDC2626)) },
                        leadingIcon = {
                            Icon(Icons.Default.Close, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isMenuExpanded = false
                            onCloseTabClick()
                        }
                    )
                }
            }
        }
    }
}
