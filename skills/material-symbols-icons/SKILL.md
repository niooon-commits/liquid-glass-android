---
name: material-symbols-icons
description: Guidelines and patterns for integrating Google Material Symbols icons using @expo/material-symbols in applications.
---

# Material Symbols Icons Skill

This skill defines the operational standards and patterns for using **Google Material Symbols** via the `@expo/material-symbols` package in applications.

## 1. Overview & Package Metadata

- **Package**: `@expo/material-symbols` (v0.1.1+)
- **Source**: Official Google Fonts [Material Symbols](https://fonts.google.com/icons)
- **Primary Style**: Outlined (default), with support for custom styles (Rounded, Sharp) via CLI
- **Available Icons**: Thousands of official Material Design symbols (e.g. `home`, `search`, `settings`, `star`, `favorite`, `menu`, etc.)

## 2. Icon Subpath Structure

Each icon is individually addressable to support tree-shaking and avoid loading unnecessary assets:
- Subpath format: `@expo/material-symbols/<icon-name>.xml`
- Examples:
  - `@expo/material-symbols/home.xml`
  - `@expo/material-symbols/search.xml`
  - `@expo/material-symbols/settings.xml`
  - `@expo/material-symbols/star.xml`
  - `@expo/material-symbols/favorite.xml`
  - `@expo/material-symbols/check.xml`
  - `@expo/material-symbols/close.xml`

## 3. Usage Patterns

### Expo / React Native Integration:
```tsx
import { Host, Icon } from "@expo/ui/jetpack-compose";
import HomeIcon from "@expo/material-symbols/home.xml";
import StarIcon from "@expo/material-symbols/star.xml";

// Rendering inside UI component
<Host matchContents>
  <Icon source={HomeIcon} size={24} tint="#1F2937" />
  <Icon source={StarIcon} size={24} tint="#EAB308" />
</Host>
```

- **`size`**: Controls icon dimension in dp (e.g. `24`, `32`).
- **`tint`**: Sets the icon color (hex code or color token). Overrides the vector drawable default fill.
- **`<Host matchContents>`**: Ensures container measures and renders with non-zero dimensions.

### Adding Custom Styles via CLI (`add-material-symbols`):
If specific axes or styles (Rounded, Sharp, Filled) are required:
```bash
# Add specific icons
npx add-material-symbols search star home

# Add rounded or sharp variants
npx add-material-symbols search --style=rounded
npx add-material-symbols settings --style=sharp
```

## 4. Web vs Native Rule:
- When building React Native / Expo applications, prioritize `@expo/material-symbols` as requested.
- For pure Web (Vite + React) without native UI runtime, ensure compatible web icon fallbacks (such as Material Symbols web font / SVG or Lucide icons) while preserving `@expo/material-symbols` configuration for cross-platform workflows.
