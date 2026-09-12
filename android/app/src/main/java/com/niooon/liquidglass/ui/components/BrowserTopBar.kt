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
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
    onHomeClick: () -> Unit,
    onSearchSubmit: (String) -> Unit,
    onNewTabClick: () -> Unit,
    onTabsOverviewClick: () -> Unit,
    onReloadClick: () -> Unit,
    onCopyUrlClick: () -> Unit,
    onShareUrlClick: () -> Unit,
    onToggleDesktopMode: () -> Unit,
    onCloseTabClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isMenuExpanded by remember { mutableStateOf(false) }
    var isUrlEditOpen by remember { mutableStateOf(false) }
    var inputUrlText by remember { mutableStateOf(currentUrl) }

    // Dialog for editing URL / Searching
    if (isUrlEditOpen) {
        AlertDialog(
            onDismissRequest = { isUrlEditOpen = false },
            title = {
                Text(
                    text = "Search or type URL",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = TextPrimary
                )
            },
            text = {
                Column {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .clip(RoundedCornerShape(24.dp))
                            .background(Color(0xFFF1F5F9))
                            .border(1.dp, Color(0xFFCBD5E1), RoundedCornerShape(24.dp))
                            .padding(horizontal = 16.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        BasicTextField(
                            value = inputUrlText,
                            onValueChange = { inputUrlText = it },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            textStyle = TextStyle(
                                color = TextPrimary,
                                fontSize = 15.sp,
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

    // Top Chrome-style Navigation Bar
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
            // Home / Back Icon Button
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

            // 1. Visited Website Domain Bar (Chrome-style capsule)
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(38.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White.copy(alpha = 0.9f))
                    .border(
                        width = 1.dp,
                        color = Color(0xFFCBD5E1),
                        shape = RoundedCornerShape(20.dp)
                    )
                    .clickable {
                        inputUrlText = if (currentUrl.isNotBlank()) currentUrl else domain
                        isUrlEditOpen = true
                    }
                    .padding(horizontal = 10.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Security Lock Icon
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Secure Connection",
                        tint = Color(0xFF16A34A), // Green lock indicator
                        modifier = Modifier.size(13.dp)
                    )

                    // Domain Text
                    Text(
                        text = if (domain.isNotBlank()) domain else "Search or URL",
                        style = TextStyle(
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
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

            // 3. Tab Counter Switcher Box ([N]) to view all tabs in a new page
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.White.copy(alpha = 0.85f))
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
