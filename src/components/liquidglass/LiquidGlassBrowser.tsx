import React, { useState } from 'react';
import {
  Search,
  Mic,
  Camera,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Compass,
  ExternalLink,
  Code2,
  Smartphone,
  Maximize2,
  Check,
  Copy,
  X,
  Sparkles,
  Wifi,
  Signal,
  Battery,
  User as UserIcon,
  Github,
  Download,
} from 'lucide-react';
import { useAuth } from '../../firebase/authContext';

interface Shortcut {
  id: string;
  name: string;
  url: string;
  iconBg: string;
  type: 'youtube' | 'instagram' | 'facebook' | 'whatsapp' | 'google' | 'x' | 'pinterest' | 'add' | 'custom';
}

interface Article {
  id: string;
  title: string;
  category: string;
  timeAgo: string;
  imageUrl: string;
  url: string;
}

const defaultShortcuts: Shortcut[] = [
  { id: '1', name: 'YouTube', url: 'https://youtube.com', iconBg: 'bg-red-600', type: 'youtube' },
  { id: '2', name: 'Instagram', url: 'https://instagram.com', iconBg: 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600', type: 'instagram' },
  { id: '3', name: 'Facebook', url: 'https://facebook.com', iconBg: 'bg-blue-600', type: 'facebook' },
  { id: '4', name: 'WhatsApp', url: 'https://web.whatsapp.com', iconBg: 'bg-emerald-500', type: 'whatsapp' },
  { id: '5', name: 'Google', url: 'https://google.com', iconBg: 'bg-white', type: 'google' },
  { id: '6', name: 'X (Twitter)', url: 'https://x.com', iconBg: 'bg-black', type: 'x' },
  { id: '7', name: 'Pinterest', url: 'https://pinterest.com', iconBg: 'bg-red-700', type: 'pinterest' },
  { id: '8', name: 'Add', url: '', iconBg: 'bg-white/40', type: 'add' },
];

const defaultArticles: Article[] = [
  {
    id: '1',
    title: 'The Most Beautiful Places on Earth',
    category: 'Travel',
    timeAgo: '2h ago',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&h=300&fit=crop',
    url: 'https://www.nationalgeographic.com/travel',
  },
  {
    id: '2',
    title: 'How AI is Changing the Future',
    category: 'Technology',
    timeAgo: '5h ago',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=300&fit=crop',
    url: 'https://techcrunch.com/category/artificial-intelligence',
  },
  {
    id: '3',
    title: 'A New Era for Space Exploration',
    category: 'Science',
    timeAgo: '1d ago',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=300&fit=crop',
    url: 'https://www.nasa.gov',
  },
];

export const LiquidGlassBrowser: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'device' | 'fluid'>('device');
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(defaultShortcuts);
  const [activeTabCount, setActiveTabCount] = useState(1);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isLensOpen, setIsLensOpen] = useState(false);
  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'MainActivity' | 'LiquidHomeScreen' | 'LiquidGlassBox' | 'buildGradle' | 'keystoreSigning'>('MainActivity');

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    let targetUrl = searchQuery.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = `https://${targetUrl}`;
      } else {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShortcutClick = (shortcut: Shortcut) => {
    if (shortcut.type === 'add') {
      setIsAddShortcutOpen(true);
      return;
    }
    if (shortcut.url) {
      window.open(shortcut.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddCustomShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcutName.trim() || !newShortcutUrl.trim()) return;

    let formattedUrl = newShortcutUrl.trim();
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newShortcut: Shortcut = {
      id: Date.now().toString(),
      name: newShortcutName.trim(),
      url: formattedUrl,
      iconBg: 'bg-indigo-600',
      type: 'custom',
    };

    // Insert before the "Add" button
    setShortcuts((prev) => {
      const items = [...prev];
      const addIndex = items.findIndex((s) => s.type === 'add');
      if (addIndex !== -1) {
        items.splice(addIndex, 0, newShortcut);
        return items;
      }
      return [...items, newShortcut];
    });

    setNewShortcutName('');
    setNewShortcutUrl('');
    setIsAddShortcutOpen(false);
  };

  const sampleKotlinFiles = {
    MainActivity: `package com.niooon.liquidglass

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.niooon.liquidglass.ui.screens.LiquidHomeScreen
import com.niooon.liquidglass.ui.theme.LiquidGlassTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LiquidGlassTheme {
                LiquidHomeScreen()
            }
        }
    }
}`,
    LiquidHomeScreen: `package com.niooon.liquidglass.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.niooon.liquidglass.ui.components.*

@Composable
fun LiquidHomeScreen() {
    val scrollState = rememberScrollState()

    Scaffold(
        bottomBar = {
            LiquidBottomBar(
                modifier = Modifier.navigationBarsPadding(),
                tabCount = 1
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(listOf(Color(0xFFBFE1FF), Color(0xFFCEEAFF))))
                .verticalScroll(scrollState)
                .statusBarsPadding()
                .padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            StatusBarIndicator()
            GoogleLogoHeader()
            LiquidSearchBar()
            QuickAccessGrid()
            DiscoverSection()
        }
    }
}`,
    LiquidGlassBox: `package com.niooon.liquidglass.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun LiquidGlassBox(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    val glassBrush = Brush.verticalGradient(
        listOf(
            Color.White.copy(alpha = 0.85f),
            Color.White.copy(alpha = 0.40f),
            Color(0xFFE2F1FF).copy(alpha = 0.60f)
        )
    )
    val borderBrush = Brush.verticalGradient(
        listOf(Color.White.copy(alpha = 0.95f), Color.White.copy(alpha = 0.40f))
    )

    Box(
        modifier = modifier
            .shadow(12.dp, RoundedCornerShape(24.dp), ambientColor = Color(0x330284C7))
            .clip(RoundedCornerShape(24.dp))
            .background(glassBrush)
            .border(1.2.dp, borderBrush, RoundedCornerShape(24.dp)),
        content = content
    )
}`,
    buildGradle: `// android/app/build.gradle.kts
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.niooon.liquidglass"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.niooon.liquidglass"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("release") {
            val keystorePath = System.getenv("KEYSTORE_PATH") ?: "\${rootDir}/my-upload-key.jks"
            storeFile = file(keystorePath)
            storePassword = System.getenv("STORE_PASSWORD") ?: "nutritrack123"
            keyAlias = System.getenv("KEY_ALIAS") ?: "upload"
            keyPassword = System.getenv("KEY_PASSWORD") ?: "nutritrack123"
        }
        create("debugConfig") {
            val debugPath = if (file("\${rootDir}/debug.keystore").exists()) {
                "\${rootDir}/debug.keystore"
            } else {
                "\${rootDir}/my-upload-key.jks"
            }
            storeFile = file(debugPath)
            storePassword = System.getenv("STORE_PASSWORD") ?: "nutritrack123"
            keyAlias = System.getenv("KEY_ALIAS") ?: "upload"
            keyPassword = System.getenv("KEY_PASSWORD") ?: "nutritrack123"
        }
    }

    buildTypes {
        release {
            isCrunchPngs = false
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            signingConfig = signingConfigs.getByName("debugConfig")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
    dependenciesInfo {
        includeInApk = false
        includeInBundle = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.05.00"))
    implementation("androidx.compose.material3:material3")
    implementation("io.coil-kt:coil-compose:2.6.0")
}`,
    keystoreSigning: `# Android Keystore Signing Configuration
# Files generated in /android directory:
# - my-upload-key.jks (Primary Upload Keystore)
# - debug.keystore (Debug Keystore matching upload)
# - keystore.properties (Build configuration properties)
# - upload-certificate.pem (Public X.509 Certificate)
# - upload-certificate.der (Google Play Console DER)

[Key Credentials]
Keystore File: android/my-upload-key.jks
Key Alias: upload
Store Password: nutritrack123
Key Password: nutritrack123

[Certificate Fingerprints]
SHA-1:
64:50:AE:47:2D:0B:9B:4C:5C:EC:3D:DE:7A:CA:A6:5C:39:32:50:A3

SHA-256:
5A:67:E9:19:88:A5:5F:57:C5:CD:D4:DA:C3:F5:B7:33:CF:46:3F:06:7D:FB:80:2D:A5:44:7F:FB:12:68:09:3C

[keystore.properties]
storeFile=my-upload-key.jks
storePassword=nutritrack123
keyAlias=upload
keyPassword=nutritrack123

[Build Command]
./gradlew assembleRelease   # Builds app-release.apk
./gradlew bundleRelease     # Builds app-release.aab (Play Store)`,
  };

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center justify-start pb-12 animate-in fade-in duration-300">
      {/* Top Banner with Architecture & Switcher */}
      <div className="w-full max-w-5xl px-4 pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sky-500 animate-pulse" />
              Liquid Glass Interface
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-300/60 dark:border-sky-700/60">
              Android Kotlin (.kt)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Refractive glassmorphic portal built with Jetpack Compose Material 3 &amp; fluid caustics
          </p>
        </div>

        {/* View Mode Controls & Code Viewer Trigger */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          <a
            href="https://github.com/niooon-commits/liquid-glass-android/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
            title="Download latest APK from GitHub Releases"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>Releases (APK)</span>
          </a>

          <a
            href="https://github.com/niooon-commits/liquid-glass-android"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="View GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          <button
            onClick={() => setShowCodeViewer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-100 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Android Code (.kt)</span>
          </button>

          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode('device')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'device'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Mobile Mockup Frame (Matches User Screenshot)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Glass</span>
            </button>
            <button
              onClick={() => setViewMode('fluid')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'fluid'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Fluid Fullscreen Display"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expanded</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Mobile Frame or Expanded Canvas */}
      <div
        className={`w-full transition-all duration-300 flex justify-center ${
          viewMode === 'device' ? 'max-w-[430px]' : 'max-w-4xl'
        }`}
      >
        {/* Device Frame Wrapper with Refractive Glass Rim */}
        <div
          id="liquid-glass-viewport"
          className="relative w-full rounded-[48px] overflow-hidden border-[8px] border-white/60 dark:border-white/30 shadow-[0_24px_80px_rgba(2,132,199,0.30)] bg-sky-200/60 transition-all select-none"
          style={{
            backgroundImage: `url('/liquid_glass_bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Fluid Caustics & Glass Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-300/30 via-white/20 to-sky-400/40 pointer-events-none backdrop-blur-[2px]" />

          {/* Ambient Refractive Bubble Orbs */}
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/40 blur-2xl pointer-events-none" />
          <div className="absolute top-1/3 -right-12 w-48 h-48 rounded-full bg-cyan-300/30 blur-2xl pointer-events-none" />
          <div className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-blue-300/30 blur-xl pointer-events-none" />

          {/* Inner Content Scroller */}
          <div className="relative z-10 flex flex-col min-h-[820px] px-4 pt-3 pb-24 text-slate-900">
            {/* Top Device Status Bar (9:41, Cellular, WiFi, 100%) */}
            <div className="w-full flex items-center justify-between px-3 py-1 text-slate-900 font-bold text-xs">
              <span className="tracking-tight text-sm font-black">9:41</span>
              <div className="flex items-center gap-1.5 text-slate-900">
                <Signal className="w-3.5 h-3.5 fill-current" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[11px] font-black">100</span>
                  <Battery className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>

            {/* Top Navigation & Profile Row */}
            <div className="w-full flex items-center justify-between mt-3 px-1">
              <div className="w-9" /> {/* Spacer for balance */}

              {/* Centered Multi-Color Google Typography Logo */}
              <div className="flex items-center justify-center select-none tracking-tight">
                <span className="text-4xl sm:text-5xl font-black text-[#4285F4] drop-shadow-xs">G</span>
                <span className="text-4xl sm:text-5xl font-black text-[#EA4335] drop-shadow-xs">o</span>
                <span className="text-4xl sm:text-5xl font-black text-[#FBBC05] drop-shadow-xs">o</span>
                <span className="text-4xl sm:text-5xl font-black text-[#4285F4] drop-shadow-xs">g</span>
                <span className="text-4xl sm:text-5xl font-black text-[#34A853] drop-shadow-xs">l</span>
                <span className="text-4xl sm:text-5xl font-black text-[#EA4335] drop-shadow-xs">e</span>
              </div>

              {/* Right User Profile Glass Circle Button */}
              <button
                id="btn-liquid-profile"
                onClick={() => alert(`Active Account: ${user ? user.email : 'Google Account Guest'}`)}
                className="relative w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl bg-white/65 hover:bg-white/80 border border-white/90 shadow-[0_4px_16px_rgba(2,132,199,0.20)] active:scale-95 transition-all text-slate-800"
                title="Account Profile"
              >
                <div className="absolute inset-x-2 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                <UserIcon className="w-5 h-5 text-slate-700 drop-shadow-2xs" />
              </button>
            </div>

            {/* Liquid Glass Capsule Search Bar */}
            <form onSubmit={handleSearch} className="w-full mt-6 px-1">
              <div className="relative w-full h-14 rounded-full flex items-center px-4 backdrop-blur-2xl bg-white/70 hover:bg-white/80 border border-white/90 shadow-[0_8px_24px_rgba(2,132,199,0.22)] ring-1 ring-white/70 transition-all group">
                {/* Specular rim refraction highlight */}
                <div className="absolute inset-x-6 top-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent" />

                {/* Left Search Lens Icon */}
                <Search className="w-5 h-5 text-slate-600 shrink-0 mr-3" />

                {/* Search Text Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or type URL"
                  className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-500 focus:outline-hidden"
                />

                {/* Right Action Icons: Google Mic & Google Lens */}
                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVoiceListening(!isVoiceListening);
                      if (!isVoiceListening) {
                        setTimeout(() => {
                          setSearchQuery('Google AI Studio Liquid Glass');
                          setIsVoiceListening(false);
                        }, 1800);
                      }
                    }}
                    className={`p-1.5 rounded-full transition-all ${
                      isVoiceListening ? 'bg-red-100 text-red-600 scale-110 animate-pulse' : 'text-red-500 hover:bg-white/60'
                    }`}
                    title="Google Voice Search"
                  >
                    <Mic className="w-5 h-5 text-[#EA4335]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLensOpen(true)}
                    className="p-1.5 rounded-full text-slate-700 hover:bg-white/60 transition-all"
                    title="Google Lens"
                  >
                    <Camera className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Access Icons Grid (2 rows x 4 items) */}
            <div className="w-full mt-7 px-1">
              <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    onClick={() => handleShortcutClick(shortcut)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    {/* 3D Liquid Glass Squircle Button with Gloss Reflection */}
                    <div className="relative w-16 h-16 rounded-[22px] flex items-center justify-center backdrop-blur-2xl bg-white/65 group-hover:bg-white/80 border border-white/90 shadow-[0_6px_20px_rgba(2,132,199,0.20)] ring-1 ring-white/60 group-active:scale-90 transition-all duration-200">
                      {/* Top specular highlight */}
                      <div className="absolute inset-x-2.5 top-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent" />

                      {/* Brand Icon Inner Badge */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xs ${shortcut.iconBg}`}>
                        {shortcut.type === 'youtube' && (
                          <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
                        )}
                        {shortcut.type === 'instagram' && (
                          <div className="w-5 h-5 rounded-md border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full border border-white" />
                          </div>
                        )}
                        {shortcut.type === 'facebook' && (
                          <span className="font-black text-xl leading-none">f</span>
                        )}
                        {shortcut.type === 'whatsapp' && (
                          <span className="text-lg">📞</span>
                        )}
                        {shortcut.type === 'google' && (
                          <span className="font-black text-xl text-[#4285F4]">G</span>
                        )}
                        {shortcut.type === 'x' && (
                          <span className="font-black text-base">𝕏</span>
                        )}
                        {shortcut.type === 'pinterest' && (
                          <span className="font-black text-lg">P</span>
                        )}
                        {shortcut.type === 'add' && (
                          <Plus className="w-6 h-6 text-slate-700" />
                        )}
                        {shortcut.type === 'custom' && (
                          <span className="font-bold text-sm uppercase">{shortcut.name.slice(0, 1)}</span>
                        )}
                      </div>
                    </div>

                    {/* App Title Label */}
                    <span className="text-[11px] font-semibold text-slate-800 mt-2 text-center truncate max-w-[70px] drop-shadow-2xs">
                      {shortcut.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discover Section in Frosted Glass Card */}
            <div className="w-full mt-7 px-1">
              <div className="w-full rounded-[28px] p-4 backdrop-blur-2xl bg-white/60 border border-white/90 shadow-[0_10px_32px_rgba(2,132,199,0.22)] ring-1 ring-white/60">
                {/* Specular Top Rim */}
                <div className="absolute inset-x-8 top-1 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent" />

                {/* Section Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-base font-bold text-slate-900">Discover</span>
                  <a
                    href="https://news.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#4285F4] hover:underline flex items-center gap-0.5"
                  >
                    <span>See more</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Article Feed Cards */}
                <div className="space-y-3">
                  {defaultArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white/50 hover:bg-white/70 border border-white/80 transition-all cursor-pointer group shadow-2xs"
                    >
                      {/* Thumbnail with rounded corners */}
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-20 h-14 object-cover rounded-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />

                      {/* Content & Metadata */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-700 transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-500">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.timeAgo}</span>
                        </div>
                      </div>

                      {/* 3-dots Menu Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Options for "${article.title}"`);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/60 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spacer for Floating Bottom Bar */}
            <div className="h-20" />
          </div>

          {/* Floating Liquid Glass Bottom Navigation Dock */}
          <div className="absolute bottom-4 inset-x-4 z-20">
            <div className="relative w-full h-16 rounded-full flex items-center justify-between px-6 backdrop-blur-2xl bg-white/75 border border-white/95 shadow-[0_12px_36px_rgba(2,132,199,0.30)] ring-1 ring-white/80">
              {/* Top Specular Rim */}
              <div className="absolute inset-x-8 top-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent" />

              {/* Back Button */}
              <button
                id="btn-liquid-back"
                onClick={() => window.history.back()}
                className="p-2 text-slate-800 hover:bg-white/60 rounded-full transition-all active:scale-90"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Forward Button */}
              <button
                id="btn-liquid-forward"
                onClick={() => window.history.forward()}
                className="p-2 text-slate-800 hover:bg-white/60 rounded-full transition-all active:scale-90"
                title="Forward"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Central Elevated Liquid Glass Search Button */}
              <button
                id="btn-liquid-search-center"
                onClick={() => {
                  const el = document.querySelector('input[placeholder="Search or type URL"]') as HTMLInputElement;
                  if (el) el.focus();
                }}
                className="relative px-6 py-2 rounded-full flex items-center justify-center backdrop-blur-xl bg-white/90 hover:bg-white border border-white shadow-[0_4px_16px_rgba(2,132,199,0.25)] active:scale-95 transition-all text-slate-800"
                title="Search"
              >
                <div className="absolute inset-x-3 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                <Search className="w-5 h-5 text-slate-800" />
              </button>

              {/* Tab Switcher Button with Active Count [1] */}
              <button
                id="btn-liquid-tabs"
                onClick={() => setActiveTabCount((prev) => (prev >= 9 ? 1 : prev + 1))}
                className="p-1.5 rounded-lg border-2 border-slate-800 flex items-center justify-center text-slate-800 font-bold text-xs hover:bg-white/60 active:scale-90 transition-all min-w-[26px] h-[26px]"
                title="Open Tabs"
              >
                {activeTabCount}
              </button>

              {/* Overflow Menu Button */}
              <button
                id="btn-liquid-menu"
                onClick={() => alert('Browser Menu: Settings, Bookmarks, History, Downloads, Share')}
                className="p-2 text-slate-800 hover:bg-white/60 rounded-full transition-all active:scale-90"
                title="More Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Home Indicator Bar (Mobile Aesthetic) */}
            <div className="w-32 h-1 rounded-full bg-slate-800/40 mx-auto mt-2.5" />
          </div>
        </div>
      </div>

      {/* Add Shortcut Modal */}
      {isAddShortcutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Glass Shortcut</h3>
              <button onClick={() => setIsAddShortcutOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCustomShortcut} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub"
                  value={newShortcutName}
                  onChange={(e) => setNewShortcutName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com"
                  value={newShortcutUrl}
                  onChange={(e) => setNewShortcutUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddShortcutOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                >
                  Add Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Lens Simulator Modal */}
      {isLensOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/40 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Google Lens Camera</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Search whatever you see. Translate text, identify plants, find products, and solve equations.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  alert('Scanning visual viewport...');
                  setIsLensOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-xs font-bold text-white shadow-xs"
              >
                Scan Camera View
              </button>
              <button
                onClick={() => setIsLensOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kotlin Android Code Inspector Sheet */}
      {showCodeViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Android Project Source Code</h3>
                  <p className="text-[11px] text-slate-400">Created in /android directory (Jetpack Compose &amp; Material 3)</p>
                </div>
              </div>
              <button
                onClick={() => setShowCodeViewer(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Tabs */}
            <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto">
              {(['MainActivity', 'LiquidHomeScreen', 'LiquidGlassBox', 'buildGradle', 'keystoreSigning'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    activeCodeTab === tab
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tab === 'MainActivity' && 'MainActivity.kt'}
                  {tab === 'LiquidHomeScreen' && 'LiquidHomeScreen.kt'}
                  {tab === 'LiquidGlassBox' && 'LiquidGlassBox.kt'}
                  {tab === 'buildGradle' && 'app/build.gradle.kts'}
                  {tab === 'keystoreSigning' && 'Keystore & Signatures'}
                </button>
              ))}
            </div>

            {/* Code Body */}
            <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed bg-slate-950 text-slate-300 relative">
              <button
                onClick={() => copyCode(activeCodeTab, sampleKotlinFiles[activeCodeTab])}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans transition-colors"
              >
                {copiedCodeKey === activeCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              <pre className="overflow-x-auto whitespace-pre">{sampleKotlinFiles[activeCodeTab]}</pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
              <span>Ready for compilation with Android Studio Giraffe+ / Gradle 8.5</span>
              <button
                onClick={() => setShowCodeViewer(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
