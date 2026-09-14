package com.niooon.liquidglass.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DeveloperMode
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.niooon.liquidglass.chromium.ChromiumAdBlocker
import com.niooon.liquidglass.chromium.ChromiumContentShell
import com.niooon.liquidglass.chromium.ChromiumEngineManager

@Composable
fun ChromiumInfoDialog(
    onDismiss: () -> Unit,
    onVisitChromiumOrg: () -> Unit
) {
    val context = LocalContext.current
    val chromiumInfo = ChromiumEngineManager.getChromiumDiagnosticInfo(context)
    val shellInfo = ChromiumContentShell.getContentShellDetails(context)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                listOf(Color(0xFF0284C7), Color(0xFF2563EB))
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Language,
                        contentDescription = "Chromium",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Column {
                    Text(
                        text = "Chromium Content Shell",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = Color(0xFF0F172A)
                    )
                    Text(
                        text = "Google Blink Core • V8 JS • Ad-Block Engine",
                        fontSize = 11.sp,
                        color = Color(0xFF64748B)
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Built on official Chromium Content Shell architecture with Google's multi-process sandboxing, high-speed Blink rendering, V8 execution, and socket-level ad & tracker blocking.",
                    fontSize = 12.sp,
                    lineHeight = 17.sp,
                    color = Color(0xFF334155)
                )

                Spacer(modifier = Modifier.height(2.dp))

                ChromiumFeatureRow(
                    icon = Icons.Default.Speed,
                    title = "Blink & V8 Runtime",
                    subtitle = "${shellInfo["Package"]} (${shellInfo["Version"]})"
                )

                ChromiumFeatureRow(
                    icon = Icons.Default.Block,
                    title = "Ad & Tracker Blocker",
                    subtitle = if (ChromiumAdBlocker.isEnabled) "Active Socket Interceptor (${ChromiumAdBlocker.totalBlockedGlobal.get()} blocked)" else "Disabled"
                )

                ChromiumFeatureRow(
                    icon = Icons.Default.Security,
                    title = "Google Safe Browsing & Sandboxing",
                    subtitle = shellInfo["Multi-Process Isolation"] ?: "Hardware Sandboxed"
                )

                ChromiumFeatureRow(
                    icon = Icons.Default.DeveloperMode,
                    title = "DevTools & Graphics Pipeline",
                    subtitle = "${shellInfo["GPU Graphics Pipeline"]} • DevTools Enabled"
                )
            }
        },
        confirmButton = {
            ElevatedButton(
                onClick = {
                    onDismiss()
                    onVisitChromiumOrg()
                },
                colors = ButtonDefaults.elevatedButtonColors(
                    containerColor = Color(0xFF0284C7),
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Visit Chromium.org", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss
            ) {
                Text("Close", color = Color(0xFF64748B), fontSize = 13.sp)
            }
        },
        containerColor = Color.White,
        shape = RoundedCornerShape(24.dp)
    )
}

@Composable
private fun ChromiumFeatureRow(
    icon: ImageVector,
    title: String,
    subtitle: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFF8FAFC))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .clip(CircleShape)
                .background(Color(0xFFE0F2FE)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Color(0xFF0284C7),
                modifier = Modifier.size(16.dp)
            )
        }
        Spacer(modifier = Modifier.width(10.dp))
        Column {
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = Color(0xFF64748B)
            )
        }
    }
}
