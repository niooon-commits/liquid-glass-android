package com.niooon.liquidglass.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.niooon.liquidglass.R
import com.niooon.liquidglass.chromium.ChromiumDownloadManager
import com.niooon.liquidglass.model.DateGroup
import com.niooon.liquidglass.model.DownloadCategory
import com.niooon.liquidglass.model.DownloadItem
import com.niooon.liquidglass.model.DownloadStatus

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChromeDownloadsScreen(
    onBack: () -> Unit,
    onOpenFile: ((DownloadItem) -> Unit)? = null
) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf(DownloadCategory.ALL) }
    var isSearchActive by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var isTopMenuExpanded by remember { mutableStateOf(false) }
    var showClearConfirmDialog by remember { mutableStateOf(false) }
    var showStorageDialog by remember { mutableStateOf(false) }

    val allDownloads = ChromiumDownloadManager.downloads

    val filteredDownloads = allDownloads.filter { item ->
        val matchesCategory = (selectedCategory == DownloadCategory.ALL) || (item.category == selectedCategory)
        val matchesSearch = searchQuery.isBlank() ||
                item.fileName.contains(searchQuery, ignoreCase = true) ||
                item.domain.contains(searchQuery, ignoreCase = true)
        matchesCategory && matchesSearch
    }

    val groupedDownloads = filteredDownloads.groupBy { it.dateGroup }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .background(Color(0xFFF8FAFC)),
        topBar = {
            Surface(
                color = Color.White,
                shadowElevation = 1.dp
            ) {
                if (isSearchActive) {
                    // Chrome Search Bar Mode
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(64.dp)
                            .padding(horizontal = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = {
                            isSearchActive = false
                            searchQuery = ""
                        }) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_arrow_back),
                                contentDescription = "Back",
                                tint = Color(0xFF1E293B),
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        BasicTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            textStyle = TextStyle(
                                fontSize = 16.sp,
                                color = Color(0xFF0F172A)
                            ),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 8.dp),
                            decorationBox = { innerTextField ->
                                if (searchQuery.isEmpty()) {
                                    Text(
                                        text = "Search downloads...",
                                        fontSize = 16.sp,
                                        color = Color(0xFF94A3B8)
                                    )
                                }
                                innerTextField()
                            }
                        )

                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_close),
                                    contentDescription = "Clear",
                                    tint = Color(0xFF64748B),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                } else {
                    // Chrome Downloads Standard Top Bar
                    TopAppBar(
                        title = {
                            Text(
                                text = "Downloads",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF1E293B)
                            )
                        },
                        navigationIcon = {
                            IconButton(onClick = onBack) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_arrow_back),
                                    contentDescription = "Back",
                                    tint = Color(0xFF1E293B),
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        },
                        actions = {
                            // Search Action Button
                            IconButton(onClick = { isSearchActive = true }) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_search),
                                    contentDescription = "Search",
                                    tint = Color(0xFF334155),
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            // Three-Dot Overflow Menu
                            Box {
                                IconButton(onClick = { isTopMenuExpanded = true }) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_more_vert),
                                        contentDescription = "More",
                                        tint = Color(0xFF334155),
                                        modifier = Modifier.size(22.dp)
                                    )
                                }

                                DropdownMenu(
                                    expanded = isTopMenuExpanded,
                                    onDismissRequest = { isTopMenuExpanded = false },
                                    modifier = Modifier
                                        .background(Color.White)
                                        .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                                ) {
                                    DropdownMenuItem(
                                        text = { Text("Storage Details", fontSize = 14.sp) },
                                        leadingIcon = {
                                            Icon(
                                                painter = painterResource(id = R.drawable.ic_info),
                                                contentDescription = null,
                                                tint = Color(0xFF0284C7),
                                                modifier = Modifier.size(18.dp)
                                            )
                                        },
                                        onClick = {
                                            isTopMenuExpanded = false
                                            showStorageDialog = true
                                        }
                                    )
                                    DropdownMenuItem(
                                        text = { Text("Clear All Downloads", fontSize = 14.sp, color = Color(0xFFDC2626)) },
                                        leadingIcon = {
                                            Icon(
                                                painter = painterResource(id = R.drawable.ic_delete),
                                                contentDescription = null,
                                                tint = Color(0xFFDC2626),
                                                modifier = Modifier.size(18.dp)
                                            )
                                        },
                                        onClick = {
                                            isTopMenuExpanded = false
                                            showClearConfirmDialog = true
                                        }
                                    )
                                }
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = Color.White
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF8FAFC))
        ) {
            // Storage Information Header (Google Chrome Style)
            StorageStatusBar()

            // Filter Chips Bar (All, Images, Pages & Docs, Audio, Videos, Other)
            FilterChipsRow(
                selectedCategory = selectedCategory,
                onCategorySelected = { selectedCategory = it }
            )

            HorizontalDivider(color = Color(0xFFE2E8F0), thickness = 1.dp)

            // Content Area: Grouped List or Empty State
            if (filteredDownloads.isEmpty()) {
                EmptyDownloadsView(hasSearchQuery = searchQuery.isNotBlank())
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    DateGroup.values().forEach { group ->
                        val itemsInGroup = groupedDownloads[group]
                        if (!itemsInGroup.isNullOrEmpty()) {
                            item(key = group.name) {
                                Text(
                                    text = group.title,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF64748B),
                                    modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                                )
                            }

                            items(
                                items = itemsInGroup,
                                key = { it.id }
                            ) { downloadItem ->
                                DownloadItemCard(
                                    item = downloadItem,
                                    onItemClick = {
                                        Toast.makeText(context, "Opening ${downloadItem.fileName}", Toast.LENGTH_SHORT).show()
                                        onOpenFile?.invoke(downloadItem)
                                    },
                                    onShare = {
                                        Toast.makeText(context, "Sharing ${downloadItem.fileName}", Toast.LENGTH_SHORT).show()
                                    },
                                    onCopyLink = {
                                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        val clip = ClipData.newPlainText("Download Link", downloadItem.sourceUrl)
                                        clipboard.setPrimaryClip(clip)
                                        Toast.makeText(context, "Link copied to clipboard", Toast.LENGTH_SHORT).show()
                                    },
                                    onDelete = {
                                        ChromiumDownloadManager.deleteDownload(downloadItem.id)
                                        Toast.makeText(context, "Deleted ${downloadItem.fileName}", Toast.LENGTH_SHORT).show()
                                    },
                                    onTogglePauseResume = {
                                        ChromiumDownloadManager.togglePauseResume(downloadItem.id)
                                    }
                                )
                            }
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(24.dp))
                    }
                }
            }
        }
    }

    // Storage Details Dialog
    if (showStorageDialog) {
        AlertDialog(
            onDismissRequest = { showStorageDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_folder),
                        contentDescription = null,
                        tint = Color(0xFF0284C7),
                        modifier = Modifier.size(24.dp)
                    )
                    Text("Download Storage", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Chromium Download Location: /Download/NIOOON",
                        fontSize = 13.sp,
                        color = Color(0xFF475569)
                    )
                    Text(
                        text = ChromiumDownloadManager.getUsedStorageText(),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF0F172A)
                    )
                    LinearProgressIndicator(
                        progress = { ChromiumDownloadManager.getStorageRatio() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(CircleShape),
                        color = Color(0xFF0284C7),
                        trackColor = Color(0xFFE2E8F0)
                    )
                    Text(
                        text = "Total files in library: ${allDownloads.size}",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B)
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showStorageDialog = false }) {
                    Text("Done", color = Color(0xFF0284C7), fontWeight = FontWeight.SemiBold)
                }
            }
        )
    }

    // Clear Confirmation Dialog
    if (showClearConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showClearConfirmDialog = false },
            title = { Text("Clear All Downloads?", fontWeight = FontWeight.Bold) },
            text = { Text("This will remove all downloaded entries from your downloads history.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        ChromiumDownloadManager.clearAll()
                        showClearConfirmDialog = false
                        Toast.makeText(context, "Downloads history cleared", Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Text("Clear All", color = Color(0xFFDC2626), fontWeight = FontWeight.SemiBold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearConfirmDialog = false }) {
                    Text("Cancel", color = Color(0xFF64748B))
                }
            }
        )
    }
}

@Composable
private fun StorageStatusBar() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF1F5F9))
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_folder),
                contentDescription = null,
                tint = Color(0xFF64748B),
                modifier = Modifier.size(16.dp)
            )
            Text(
                text = "Downloads • 12.4 GB of 64 GB used",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF475569)
            )
        }

        LinearProgressIndicator(
            progress = { 0.19f },
            modifier = Modifier
                .width(72.dp)
                .height(6.dp)
                .clip(CircleShape),
            color = Color(0xFF0284C7),
            trackColor = Color(0xFFCBD5E1)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterChipsRow(
    selectedCategory: DownloadCategory,
    onCategorySelected: (DownloadCategory) -> Unit
) {
    val scrollState = rememberScrollState()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .horizontalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        DownloadCategory.values().forEach { category ->
            val isSelected = category == selectedCategory
            FilterChip(
                selected = isSelected,
                onClick = { onCategorySelected(category) },
                label = {
                    Text(
                        text = category.label,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
                    )
                },
                colors = FilterChipDefaults.filterChipColors(
                    containerColor = Color(0xFFF8FAFC),
                    labelColor = Color(0xFF475569),
                    selectedContainerColor = Color(0xFFE0F2FE),
                    selectedLabelColor = Color(0xFF0369A1)
                ),
                border = FilterChipDefaults.filterChipBorder(
                    borderColor = if (isSelected) Color(0xFFBAE6FD) else Color(0xFFE2E8F0),
                    selectedBorderColor = Color(0xFF0284C7),
                    borderWidth = 1.dp
                ),
                shape = RoundedCornerShape(20.dp)
            )
        }
    }
}

@Composable
private fun DownloadItemCard(
    item: DownloadItem,
    onItemClick: () -> Unit,
    onShare: () -> Unit,
    onCopyLink: () -> Unit,
    onDelete: () -> Unit,
    onTogglePauseResume: () -> Unit
) {
    var isMenuOpen by remember { mutableStateOf(false) }

    // Visual Palette & Icons from official Google Material Symbols
    val (iconRes, iconTint, iconBg) = when (item.category) {
        DownloadCategory.OTHER -> {
            if (item.fileName.endsWith(".apk", ignoreCase = true)) {
                Triple(R.drawable.ic_android, Color(0xFF10B981), Color(0xFFECFDF5))
            } else {
                Triple(R.drawable.ic_folder, Color(0xFF64748B), Color(0xFFF1F5F9))
            }
        }
        DownloadCategory.PAGES_DOCS -> Triple(R.drawable.ic_description, Color(0xFFEF4444), Color(0xFFFEF2F2))
        DownloadCategory.IMAGES -> Triple(R.drawable.ic_image, Color(0xFF3B82F6), Color(0xFFEFF6FF))
        DownloadCategory.VIDEOS -> Triple(R.drawable.ic_movie, Color(0xFF8B5CF6), Color(0xFFF5F3FF))
        DownloadCategory.AUDIO -> Triple(R.drawable.ic_music_note, Color(0xFFF59E0B), Color(0xFFFFFBEB))
        DownloadCategory.ALL -> Triple(R.drawable.ic_download, Color(0xFF0284C7), Color(0xFFE0F2FE))
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(14.dp))
            .clickable(onClick = onItemClick),
        color = Color.White
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // File Type Vector Icon Badge
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(iconBg),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = iconRes),
                        contentDescription = null,
                        tint = iconTint,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // File Details
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.fileName,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF0F172A),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = "${item.fileSize} • ${item.domain} • ${item.date}",
                        fontSize = 11.sp,
                        color = Color(0xFF64748B),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Item Actions & Three-Dot Overflow Menu
                if (item.status == DownloadStatus.DOWNLOADING || item.status == DownloadStatus.PAUSED) {
                    IconButton(onClick = onTogglePauseResume) {
                        Icon(
                            painter = painterResource(
                                id = if (item.status == DownloadStatus.DOWNLOADING) R.drawable.ic_pause else R.drawable.ic_play_arrow
                            ),
                            contentDescription = "Pause/Resume",
                            tint = Color(0xFF0284C7),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                Box {
                    IconButton(onClick = { isMenuOpen = true }) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_more_vert),
                            contentDescription = "Menu",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    DropdownMenu(
                        expanded = isMenuOpen,
                        onDismissRequest = { isMenuOpen = false },
                        modifier = Modifier
                            .background(Color.White)
                            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                    ) {
                        DropdownMenuItem(
                            text = { Text("Open File", fontSize = 14.sp) },
                            leadingIcon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_folder),
                                    contentDescription = null,
                                    tint = Color(0xFF0284C7),
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            onClick = {
                                isMenuOpen = false
                                onItemClick()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Share Link", fontSize = 14.sp) },
                            leadingIcon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_share),
                                    contentDescription = null,
                                    tint = Color(0xFF475569),
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            onClick = {
                                isMenuOpen = false
                                onShare()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Copy Link Address", fontSize = 14.sp) },
                            leadingIcon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_content_copy),
                                    contentDescription = null,
                                    tint = Color(0xFF475569),
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            onClick = {
                                isMenuOpen = false
                                onCopyLink()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Delete", fontSize = 14.sp, color = Color(0xFFDC2626)) },
                            leadingIcon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_delete),
                                    contentDescription = null,
                                    tint = Color(0xFFDC2626),
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            onClick = {
                                isMenuOpen = false
                                onDelete()
                            }
                        )
                    }
                }
            }

            // If downloading, show live download progress bar
            if (item.status == DownloadStatus.DOWNLOADING || item.status == DownloadStatus.PAUSED) {
                Spacer(modifier = Modifier.height(8.dp))
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    LinearProgressIndicator(
                        progress = { item.progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .clip(CircleShape),
                        color = if (item.status == DownloadStatus.DOWNLOADING) Color(0xFF0284C7) else Color(0xFFF59E0B),
                        trackColor = Color(0xFFE2E8F0)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = if (item.status == DownloadStatus.DOWNLOADING) "Downloading... ${(item.progress * 100).toInt()}%" else "Paused",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (item.status == DownloadStatus.DOWNLOADING) Color(0xFF0284C7) else Color(0xFFD97706)
                        )
                        if (item.downloadSpeed.isNotEmpty() && item.status == DownloadStatus.DOWNLOADING) {
                            Text(
                                text = item.downloadSpeed,
                                fontSize = 10.sp,
                                color = Color(0xFF64748B)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyDownloadsView(hasSearchQuery: Boolean) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(Color(0xFFE0F2FE)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_download),
                contentDescription = null,
                tint = Color(0xFF0284C7),
                modifier = Modifier.size(36.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = if (hasSearchQuery) "No matching downloads" else "Files you download appear here",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF1E293B)
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = if (hasSearchQuery) "Try searching for a different file name or domain." else "You can download files, images, and pages while browsing the web.",
            fontSize = 13.sp,
            color = Color(0xFF64748B),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}
