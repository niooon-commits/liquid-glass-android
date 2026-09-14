package com.niooon.liquidglass.chromium

import androidx.compose.runtime.mutableStateListOf
import com.niooon.liquidglass.model.DateGroup
import com.niooon.liquidglass.model.DownloadCategory
import com.niooon.liquidglass.model.DownloadItem
import com.niooon.liquidglass.model.DownloadStatus
import java.util.UUID

object ChromiumDownloadManager {

    val downloads = mutableStateListOf<DownloadItem>()

    init {
        seedSampleDownloads()
    }

    private fun seedSampleDownloads() {
        if (downloads.isNotEmpty()) return

        downloads.addAll(
            listOf(
                DownloadItem(
                    id = UUID.randomUUID().toString(),
                    fileName = "liquid-glass-browser-v1.2.0.apk",
                    fileSize = "24.8 MB",
                    fileSizeBytes = 26004684L,
                    date = "Today, 10:45 AM",
                    dateGroup = DateGroup.TODAY,
                    category = DownloadCategory.OTHER,
                    sourceUrl = "https://github.com/niooon-commits/liquid-glass-android",
                    domain = "github.com",
                    mimeType = "application/vnd.android.package-archive",
                    status = DownloadStatus.COMPLETED
                ),
                DownloadItem(
                    id = UUID.randomUUID().toString(),
                    fileName = "chromium-engine-architecture.pdf",
                    fileSize = "3.4 MB",
                    fileSizeBytes = 3565158L,
                    date = "Today, 09:15 AM",
                    dateGroup = DateGroup.TODAY,
                    category = DownloadCategory.PAGES_DOCS,
                    sourceUrl = "https://chromium.googlesource.com/specs",
                    domain = "chromium.googlesource.com",
                    mimeType = "application/pdf",
                    status = DownloadStatus.COMPLETED
                ),
                DownloadItem(
                    id = UUID.randomUUID().toString(),
                    fileName = "google-material-symbols-pack.zip",
                    fileSize = "18.2 MB",
                    fileSizeBytes = 19084083L,
                    date = "Today, 08:30 AM",
                    dateGroup = DateGroup.TODAY,
                    category = DownloadCategory.OTHER,
                    sourceUrl = "https://fonts.google.com/icons",
                    domain = "fonts.google.com",
                    mimeType = "application/zip",
                    status = DownloadStatus.DOWNLOADING,
                    progress = 0.68f,
                    downloadSpeed = "2.4 MB/s"
                ),
                DownloadItem(
                    id = UUID.randomUUID().toString(),
                    fileName = "amoled-aurora-minimalist.png",
                    fileSize = "4.2 MB",
                    fileSizeBytes = 4404019L,
                    date = "Yesterday, 04:20 PM",
                    dateGroup = DateGroup.YESTERDAY,
                    category = DownloadCategory.IMAGES,
                    sourceUrl = "https://unsplash.com/photos/aurora-lake",
                    domain = "unsplash.com",
                    mimeType = "image/png",
                    status = DownloadStatus.COMPLETED
                ),
                DownloadItem(
                    id = UUID.randomUUID().toString(),
                    fileName = "android-14-developer-preview.mp4",
                    fileSize = "62.4 MB",
                    fileSizeBytes = 65431142L,
                    date = "Yesterday, 02:10 PM",
                    dateGroup = DateGroup.YESTERDAY,
                    category = DownloadCategory.VIDEOS,
                    sourceUrl = "https://developer.android.com/videos/compose",
                    domain = "developer.android.com",
                    mimeType = "video/mp4",
                    status = DownloadStatus.COMPLETED
                ),
                DownloadItem(
                    id = UUID.randomUUID().toString(),
                    fileName = "lofi-focus-beats-ambient.mp3",
                    fileSize = "8.6 MB",
                    fileSizeBytes = 9017753L,
                    date = "Earlier this month",
                    dateGroup = DateGroup.EARLIER,
                    category = DownloadCategory.AUDIO,
                    sourceUrl = "https://archive.org/audio/focus-beats",
                    domain = "archive.org",
                    mimeType = "audio/mpeg",
                    status = DownloadStatus.COMPLETED
                )
            )
        )
    }

    fun deleteDownload(id: String) {
        downloads.removeAll { it.id == id }
    }

    fun clearAll() {
        downloads.clear()
    }

    fun togglePauseResume(id: String) {
        val index = downloads.indexOfFirst { it.id == id }
        if (index != -1) {
            val item = downloads[index]
            if (item.status == DownloadStatus.DOWNLOADING) {
                downloads[index] = item.copy(status = DownloadStatus.PAUSED)
            } else if (item.status == DownloadStatus.PAUSED) {
                downloads[index] = item.copy(status = DownloadStatus.DOWNLOADING)
            }
        }
    }

    fun addDownload(
        fileName: String,
        fileSize: String,
        fileSizeBytes: Long,
        category: DownloadCategory,
        sourceUrl: String,
        domain: String,
        mimeType: String
    ): DownloadItem {
        val item = DownloadItem(
            id = UUID.randomUUID().toString(),
            fileName = fileName,
            fileSize = fileSize,
            fileSizeBytes = fileSizeBytes,
            date = "Today, Just now",
            dateGroup = DateGroup.TODAY,
            category = category,
            sourceUrl = sourceUrl,
            domain = domain,
            mimeType = mimeType,
            status = DownloadStatus.COMPLETED
        )
        downloads.add(0, item)
        return item
    }

    fun getUsedStorageText(): String {
        return "12.4 GB of 64 GB used • 51.6 GB available"
    }

    fun getStorageRatio(): Float {
        return 0.19f
    }
}
