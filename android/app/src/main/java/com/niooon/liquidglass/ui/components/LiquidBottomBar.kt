package com.niooon.liquidglass.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBackIosNew
import androidx.compose.material.icons.filled.ArrowForwardIos
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.niooon.liquidglass.ui.theme.TextPrimary

@Composable
fun LiquidBottomBar(
    modifier: Modifier = Modifier,
    canGoBack: Boolean = true,
    canGoForward: Boolean = false,
    tabCount: Int = 1,
    onBackClick: () -> Unit = {},
    onForwardClick: () -> Unit = {},
    onSearchClick: () -> Unit = {},
    onTabsClick: () -> Unit = {},
    onMenuClick: () -> Unit = {}
) {
    LiquidGlassPill(
        modifier = modifier
            .fillMaxWidth()
            .height(64.dp)
            .padding(horizontal = 20.dp),
        elevation = 14.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 1. Back Chevron
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clickable(enabled = canGoBack) { onBackClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBackIosNew,
                    contentDescription = "Back",
                    tint = if (canGoBack) TextPrimary else TextPrimary.copy(alpha = 0.35f),
                    modifier = Modifier.size(18.dp)
                )
            }

            // 2. Forward Chevron
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clickable(enabled = canGoForward) { onForwardClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowForwardIos,
                    contentDescription = "Forward",
                    tint = if (canGoForward) TextPrimary else TextPrimary.copy(alpha = 0.35f),
                    modifier = Modifier.size(18.dp)
                )
            }

            // 3. Central Elevated Liquid Glass Search Button
            Box(
                modifier = Modifier
                    .size(width = 68.dp, height = 40.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        brush = Brush.verticalGradient(
                            listOf(
                                Color.White.copy(alpha = 0.90f),
                                Color(0xFFD6E4F0).copy(alpha = 0.60f)
                            )
                        )
                    )
                    .border(
                        width = 1.2.dp,
                        color = Color.White.copy(alpha = 0.95f),
                        shape = RoundedCornerShape(20.dp)
                    )
                    .clickable { onSearchClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search Bar",
                    tint = TextPrimary,
                    modifier = Modifier.size(20.dp)
                )
            }

            // 4. Tab Switcher Button with Count [1]
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clickable { onTabsClick() },
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .border(
                            width = 1.8.dp,
                            color = TextPrimary.copy(alpha = 0.85f),
                            shape = RoundedCornerShape(6.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "$tabCount",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }
            }

            // 5. Overflow 3-Dots Menu
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clickable { onMenuClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.MoreVert,
                    contentDescription = "Menu",
                    tint = TextPrimary,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
    }
}
