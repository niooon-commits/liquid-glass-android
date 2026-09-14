package com.niooon.liquidglass.model

enum class DownloadCategory(val label: String) {
    ALL("All"),
    IMAGES("Images"),
    PAGES_DOCS("Pages & Docs"),
    AUDIO("Audio"),
    VIDEOS("Videos"),
    OTHER("Other")
}

enum class DownloadStatus {
    COMPLETED,
    DOWNLOADING,
    PAUSED,
    FAILED
}

enum class DateGroup(val title: String) {
    TODAY("Today"),
    YESTERDAY("Yesterday"),
    EARLIER("Earlier this month")
}

data class DownloadItem(
    val id: String,
    val fileName: String,
    val fileSize: String,
    val fileSizeBytes: Long,
    val date: String,
    val dateGroup: DateGroup,
    val category: DownloadCategory,
    val sourceUrl: String,
    val domain: String,
    val mimeType: String,
    val status: DownloadStatus = DownloadStatus.COMPLETED,
    val progress: Float = 1.0f,
    val downloadSpeed: String = ""
)
