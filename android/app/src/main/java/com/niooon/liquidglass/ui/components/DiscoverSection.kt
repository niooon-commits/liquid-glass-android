package com.niooon.liquidglass.ui.components

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.niooon.liquidglass.ui.theme.GoogleBlue
import com.niooon.liquidglass.ui.theme.TextMuted
import com.niooon.liquidglass.ui.theme.TextPrimary

data class DiscoverArticle(
    val id: String,
    val title: String,
    val category: String,
    val timeAgo: String,
    val imageUrl: String,
    val articleUrl: String
)

val SampleDiscoverArticles = listOf(
    DiscoverArticle(
        id = "1",
        title = "The Most Beautiful Places on Earth",
        category = "Travel",
        timeAgo = "2h ago",
        imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=250&fit=crop",
        articleUrl = "https://example.com/places"
    ),
    DiscoverArticle(
        id = "2",
        title = "How AI is Changing the Future",
        category = "Technology",
        timeAgo = "5h ago",
        imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=250&fit=crop",
        articleUrl = "https://example.com/ai"
    ),
    DiscoverArticle(
        id = "3",
        title = "A New Era for Space Exploration",
        category = "Science",
        timeAgo = "1d ago",
        imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
        articleUrl = "https://example.com/space"
    )
)

@Composable
fun DiscoverSection(
    modifier: Modifier = Modifier,
    articles: List<DiscoverArticle> = SampleDiscoverArticles,
    onSeeMoreClick: () -> Unit = {},
    onArticleClick: (DiscoverArticle) -> Unit = {}
) {
    LiquidGlassBox(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(26.dp),
        elevation = 10.dp,
        tintAlpha = 0.58f
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header Row: Discover & See more >
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Discover",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { onSeeMoreClick() }
                ) {
                    Text(
                        text = "See more",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = GoogleBlue
                    )
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "See more",
                        tint = GoogleBlue,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // Article Rows
            articles.forEach { article ->
                DiscoverArticleRow(
                    article = article,
                    onClick = { onArticleClick(article) }
                )
            }
        }
    }
}

@Composable
fun DiscoverArticleRow(
    article: DiscoverArticle,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White.copy(alpha = 0.40f))
            .clickable { onClick() }
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Rounded article preview thumbnail
        AsyncImage(
            model = article.imageUrl,
            contentDescription = article.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(width = 84.dp, height = 54.dp)
                .clip(RoundedCornerShape(12.dp))
        )

        Spacer(modifier = Modifier.width(12.dp))

        // Title and Category/Time Meta
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = article.title,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(3.dp))

            Text(
                text = "${article.category} · ${article.timeAgo}",
                fontSize = 11.sp,
                color = TextMuted
            )
        }

        // 3-dots overflow icon
        Icon(
            imageVector = Icons.Default.MoreVert,
            contentDescription = "Options",
            tint = TextMuted,
            modifier = Modifier
                .padding(start = 4.dp)
                .size(20.dp)
        )
    }
}
