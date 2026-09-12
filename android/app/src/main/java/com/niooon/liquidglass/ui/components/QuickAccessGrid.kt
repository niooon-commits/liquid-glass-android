package com.niooon.liquidglass.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.niooon.liquidglass.ui.theme.FacebookBlue
import com.niooon.liquidglass.ui.theme.GoogleBlue
import com.niooon.liquidglass.ui.theme.PinterestRed
import com.niooon.liquidglass.ui.theme.TextPrimary
import com.niooon.liquidglass.ui.theme.WhatsAppGreen
import com.niooon.liquidglass.ui.theme.YouTubeRed

data class QuickAccessItemData(
    val id: String,
    val title: String,
    val url: String,
    val brandColor: Color,
    val iconType: IconType
)

enum class IconType {
    YOUTUBE, INSTAGRAM, FACEBOOK, WHATSAPP, GOOGLE, TWITTER_X, PINTEREST, CHROMIUM, ADD
}

val DefaultQuickAccessItems = listOf(
    QuickAccessItemData("gg", "Google", "https://google.com", GoogleBlue, IconType.GOOGLE),
    QuickAccessItemData("chromium", "Chromium", "https://www.chromium.org/chromium-projects/", Color(0xFF0284C7), IconType.CHROMIUM),
    QuickAccessItemData("yt", "YouTube", "https://youtube.com", YouTubeRed, IconType.YOUTUBE),
    QuickAccessItemData("ig", "Instagram", "https://instagram.com", Color(0xFFE1306C), IconType.INSTAGRAM),
    QuickAccessItemData("fb", "Facebook", "https://facebook.com", FacebookBlue, IconType.FACEBOOK),
    QuickAccessItemData("wa", "WhatsApp", "https://web.whatsapp.com", WhatsAppGreen, IconType.WHATSAPP),
    QuickAccessItemData("x", "X (Twitter)", "https://x.com", Color.Black, IconType.TWITTER_X),
    QuickAccessItemData("pin", "Pinterest", "https://pinterest.com", PinterestRed, IconType.PINTEREST),
    QuickAccessItemData("add", "Add", "", Color(0xFF0284C7), IconType.ADD)
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun QuickAccessGrid(
    modifier: Modifier = Modifier,
    items: List<QuickAccessItemData> = DefaultQuickAccessItems,
    onItemClick: (QuickAccessItemData) -> Unit = {}
) {
    FlowRow(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        maxItemsInEachRow = 4,
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items.forEach { item ->
            QuickAccessButton(
                item = item,
                onClick = { onItemClick(item) }
            )
        }
    }
}

@Composable
fun QuickAccessButton(
    item: QuickAccessItemData,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .size(width = 76.dp, height = 94.dp)
            .clickable { onClick() }
    ) {
        // Liquid Glass Squircle Container with 3D Gloss
        LiquidGlassBox(
            modifier = Modifier.size(62.dp),
            shape = RoundedCornerShape(20.dp),
            elevation = 6.dp,
            tintAlpha = 0.60f
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .align(Alignment.Center)
                    .clip(CircleShape)
                    .background(
                        when (item.iconType) {
                            IconType.YOUTUBE -> Brush.linearGradient(listOf(Color(0xFFFF1E1E), Color(0xFFCC0000)))
                            IconType.INSTAGRAM -> Brush.linearGradient(
                                listOf(Color(0xFF833AB4), Color(0xFFFD1D1D), Color(0xFFFCB045))
                            )
                            IconType.FACEBOOK -> Brush.linearGradient(listOf(Color(0xFF1877F2), Color(0xFF0B58C9)))
                            IconType.WHATSAPP -> Brush.linearGradient(listOf(Color(0xFF25D366), Color(0xFF128C7E)))
                            IconType.GOOGLE -> Brush.linearGradient(listOf(Color.White, Color.White))
                            IconType.TWITTER_X -> Brush.linearGradient(listOf(Color.Black, Color(0xFF111111)))
                            IconType.PINTEREST -> Brush.linearGradient(listOf(Color(0xFFE60023), Color(0xFFAD081B)))
                            IconType.CHROMIUM -> Brush.linearGradient(listOf(Color(0xFF0284C7), Color(0xFF2563EB)))
                            IconType.ADD -> Brush.linearGradient(listOf(Color.White.copy(alpha = 0.5f), Color.White.copy(alpha = 0.2f)))
                            else -> Brush.linearGradient(listOf(Color.White, Color.White))
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                when (item.iconType) {
                    IconType.YOUTUBE -> {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = item.title,
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    IconType.INSTAGRAM -> {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = item.title,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    IconType.ADD -> {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add shortcut",
                            tint = TextPrimary.copy(alpha = 0.8f),
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    IconType.GOOGLE -> {
                        Text(
                            text = "G",
                            color = GoogleBlue,
                            fontWeight = FontWeight.Black,
                            fontSize = 22.sp
                        )
                    }
                    IconType.TWITTER_X -> {
                        Text(
                            text = "𝕏",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                    IconType.FACEBOOK -> {
                        Text(
                            text = "f",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp
                        )
                    }
                    IconType.WHATSAPP -> {
                        Text(
                            text = "📞",
                            fontSize = 17.sp
                        )
                    }
                    IconType.PINTEREST -> {
                        Text(
                            text = "P",
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp
                        )
                    }
                    IconType.CHROMIUM -> {
                        Icon(
                            imageVector = Icons.Default.Language,
                            contentDescription = "Chromium",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    IconType.ADD -> {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    else -> {}
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Title Label
        Text(
            text = item.title,
            color = TextPrimary.copy(alpha = 0.85f),
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            textAlign = TextAlign.Center
        )
    }
}
