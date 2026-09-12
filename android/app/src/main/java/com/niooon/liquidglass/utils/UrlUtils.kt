package com.niooon.liquidglass.utils

import java.net.URI
import java.net.URLEncoder

object UrlUtils {
    fun formatInputToUrl(input: String): String {
        val trimmed = input.trim()
        if (trimmed.isEmpty()) return "https://www.google.com"

        if (trimmed.startsWith("http://", ignoreCase = true) || trimmed.startsWith("https://", ignoreCase = true)) {
            return trimmed
        }

        // Check if input resembles a domain or URL path (e.g. "youtube.com", "m.facebook.com/login")
        val domainPattern = Regex("^([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}(/.*)?$")
        return if (domainPattern.matches(trimmed)) {
            "https://$trimmed"
        } else {
            val encoded = try {
                URLEncoder.encode(trimmed, "UTF-8")
            } catch (e: Exception) {
                trimmed
            }
            "https://www.google.com/search?q=$encoded"
        }
    }

    fun extractDomain(url: String): String {
        return try {
            val uri = URI(url)
            val host = uri.host ?: url
            host.removePrefix("www.")
        } catch (e: Exception) {
            val withoutProtocol = if (url.contains("://")) url.substringAfter("://") else url
            withoutProtocol.substringBefore("/").removePrefix("www.")
        }
    }
}
