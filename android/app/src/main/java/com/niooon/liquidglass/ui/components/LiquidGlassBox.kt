package com.niooon.liquidglass.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * High-fidelity Liquid Glass container replicating the translucent refractive glass
 * aesthetic seen in modern fluid Android UI designs.
 */
@Composable
fun LiquidGlassBox(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(24.dp),
    elevation: Dp = 10.dp,
    tintAlpha: Float = 0.55f,
    content: @Composable BoxScope.() -> Unit
) {
    val glassFillBrush = Brush.verticalGradient(
        colors = listOf(
            Color.White.copy(alpha = (tintAlpha + 0.25f).coerceAtMost(0.92f)),
            Color.White.copy(alpha = (tintAlpha * 0.70f).coerceAtLeast(0.30f)),
            Color(0xFFE2F1FF).copy(alpha = (tintAlpha * 0.85f).coerceAtLeast(0.35f))
        )
    )

    val specularBorderBrush = Brush.verticalGradient(
        colors = listOf(
            Color.White.copy(alpha = 0.95f),
            Color.White.copy(alpha = 0.40f),
            Color(0xFF90CDF4).copy(alpha = 0.30f)
        )
    )

    Box(
        modifier = modifier
            .shadow(
                elevation = elevation,
                shape = shape,
                ambientColor = Color(0x330284C7),
                spotColor = Color(0x4038BDF8)
            )
            .clip(shape)
            .background(brush = glassFillBrush)
            .border(
                width = 1.2.dp,
                brush = specularBorderBrush,
                shape = shape
            )
            .drawBehind {
                // Subtle top inner highlight shimmer for refractive water/liquid illusion
                drawLine(
                    color = Color.White.copy(alpha = 0.8f),
                    start = Offset(x = 16f, y = 2f),
                    end = Offset(x = size.width - 16f, y = 2f),
                    strokeWidth = 2f
                )
            },
        content = content
    )
}

/**
 * Liquid Glass Capsule for search bars, bottom docks, and navigation pills.
 */
@Composable
fun LiquidGlassPill(
    modifier: Modifier = Modifier,
    elevation: Dp = 8.dp,
    content: @Composable BoxScope.() -> Unit
) {
    LiquidGlassBox(
        modifier = modifier,
        shape = RoundedCornerShape(percent = 50),
        elevation = elevation,
        tintAlpha = 0.65f,
        content = content
    )
}
