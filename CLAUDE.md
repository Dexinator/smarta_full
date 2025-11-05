# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Santa Marta Full** is a tourism website built with Astro, React, and Tailwind CSS for Santa Marta de Tormes. It features:

- **Virtual Offices** ("Oficinas Virtuales"): Interactive tourism information pages with video heroes, maps, schedules, and activities for different themes (Arte, Natural, Motera, Familiar)
- **Gamified Adventures** ("Aventuras Gamificadas"): Interactive story-driven experiences with image galleries, maps, and downloadable brochures in multiple languages and accessibility formats
- **Audio Guides** ("Audioguías"): Audio-guided tours of murals and natural sites
- **Bilingual Support**: Spanish (default) and English with `/en` prefix routing

## Commands

### Development
```bash
npm run dev          # Start dev server at localhost:4321
npm run build        # Build for production to ./dist/
npm run preview      # Preview production build locally
```

### Astro CLI
```bash
npm run astro check  # Type check Astro components
npm run astro add    # Add integrations
```

## Architecture

### Tech Stack
- **Framework**: Astro 5.x with React integration
- **Styling**: Tailwind CSS 4.x (via Vite plugin)
- **Content**: JSON-based content collections with Zod validation
- **Maps**: Leaflet (dynamically loaded in React component)
- **Media**: Vimeo embedded player for hero videos

### Key Directories

```
src/
├── components/
│   ├── adventure/     # Adventure-specific components (ImageGallery, MapSection, DownloadBrochure)
│   ├── react/         # React components (MapComponent, VimeoHeroPlayer, PartnersSlider)
│   ├── sections/      # Home page sections (HeroSection, TouristInfo, AudioGuides, GamifiedAdventures)
│   └── ui/           # Common UI (Header, Footer)
├── content/
│   ├── adventures/    # JSON configs for adventure pages (santa-martaxplora-espanol.json, etc.)
│   ├── virtual-offices/ # JSON configs for virtual office pages (oficina-artistica.json, etc.)
│   └── config.ts      # Zod schemas for content validation
├── layouts/
│   ├── AdventureContentLayout.astro  # Reusable layout for adventures
│   ├── VirtualOfficeLayout.astro     # Reusable layout for virtual offices
│   └── AdventureMenuLayout.astro     # Menu layout for adventure selection
├── pages/
│   ├── index.astro                   # Spanish home page
│   ├── en/index.astro                # English home page
│   ├── ofi_[theme].astro             # Virtual office pages (arte, natural, motera, familiar)
│   └── aventuras/[adventure]/        # Adventure page directories with language variants
├── assets/
│   ├── images/adventures/            # Adventure images organized by adventure name
│   ├── images/adventures/sliders/    # Slider images per adventure and language
│   └── docs/                         # PDF brochures and text content
├── i18n/
│   ├── locales/      # JSON translation files (es.json, en.json)
│   └── utils.ts      # i18n utilities (getTranslations, getLocalizedUrl, etc.)
└── data/             # Static JSON data files (content-es.json, content-en.json)

public/
├── docs/             # Public PDF files for downloads
└── fonts/            # Nunito font files (variable and static)
```

### Content Collections System

The project uses Astro Content Collections for type-safe, structured content management:

#### Virtual Offices
- **Schema**: `src/content/config.ts` defines the structure with Zod
- **Content**: JSON files in `src/content/virtual-offices/`
- **Sections**: Hero video, Lectura Fácil (easy reading), Map, Banner CTA, Info/Schedule, Activities
- **Usage**: Pages load config via `getEntry('virtual-offices', 'oficina-name')` and pass to `VirtualOfficeLayout`
- **Visibility Control**: Each section has a `visible` boolean to show/hide
- **Location Data**: Reads coordinates from `locaciones_ofi_virtual.csv` for map markers

#### Adventures
- **Schema**: Defined inline in JSON files, no formal Zod schema yet
- **Content**: JSON files in `src/content/adventures/`
- **Naming Pattern**: `[adventure-name]-[language/variant].json` (e.g., `santa-martaxplora-espanol.json`, `santa-martaxplora-lectura-facil.json`)
- **Sections**: Image gallery (landscape/portrait with media buttons), map with locations, download brochure, other adventures carousel
- **Usage**: Import JSON directly in `.astro` pages and pass to `AdventureContentLayout`
- **Image Gallery**: Supports audio/video buttons per image, configurable button positions (top-left, top-right, bottom-left, bottom-right)

### Routing & i18n

- **Default Locale**: Spanish (`/`)
- **English**: `/en` prefix (`/en/page-name`)
- **Configuration**: `astro.config.mjs` with `prefixDefaultLocale: false`
- **Utilities**: `src/i18n/utils.ts` provides helpers:
  - `getTranslations(locale)` - Get translation strings
  - `getLocalizedUrl(path, locale)` - Generate locale-specific URLs
  - `getAlternateUrl(currentPath, currentLocale)` - Toggle between languages

### Reusable Layouts

#### VirtualOfficeLayout.astro
Renders virtual office pages with optional sections controlled by JSON config. Automatically displays "burbujas" (bubble navigation icons) based on the `burbujas` array in the config.

**Key Features**:
- Video hero with Vimeo player
- Downloadable PDF for easy reading (Lectura Fácil)
- Interactive Leaflet map with custom markers
- Schedule information with seasonal hours
- Activity cards with gradient backgrounds

#### AdventureContentLayout.astro
Renders adventure/experience pages with configurable sections.

**Key Features**:
- Image gallery (landscape/portrait orientation)
- Media buttons (audio/video) per image
- Interactive map with adventure points of interest
- PDF brochure download section
- "Other Adventures" carousel

**Configuration Props**:
```typescript
{
  imageGallery: {
    visible: boolean,
    orientation: 'landscape' | 'portrait',
    buttonsPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    images: Array<{src, alt, mediaButton: {type, url, label}}>
  },
  map: {
    visible: boolean,
    center: [lat, lng],
    zoom: number,
    locations: Array<{coordinates, name, description}>
  },
  downloadBrochure: {
    visible: boolean,
    title: string,
    pdfPath: string,
    buttonText: string
  }
}
```

### React Components

React components are integrated via `@astrojs/react` and use `client:load` or `client:visible` directives.

**Key Components**:
- `MapComponent.jsx`: Leaflet map with markers, scroll lock/unlock, mobile-responsive
- `VimeoHeroPlayer.jsx`: Embedded Vimeo player with custom controls
- `PartnersSlider.jsx`: Partner logos carousel
- `MediaModal.jsx`: Modal for displaying audio/video content from adventure images

### Styling

- **Tailwind CSS 4.x**: Configured via Vite plugin (no separate config file needed)
- **Custom Colors**: `SM-blue`, `SM-yellow` (defined in CSS/Tailwind config)
- **Fonts**: Nunito variable font loaded from `public/fonts/`
- **Responsive**: Mobile-first with scroll-snap on mobile home page sections

## Development Patterns

### Adding a New Virtual Office Page

1. Create JSON config in `src/content/virtual-offices/nombre-oficina.json`
2. Set `visible: true/false` for each section as needed
3. Add location coordinates to `locaciones_ofi_virtual.csv` if using map
4. Create page in `src/pages/ofi_nombre.astro`:
   ```astro
   ---
   import { getEntry } from 'astro:content';
   import VirtualOfficeLayout from '../layouts/VirtualOfficeLayout.astro';
   const config = await getEntry('virtual-offices', 'nombre-oficina');
   ---
   <VirtualOfficeLayout config={config.data} />
   ```

### Adding a New Adventure

1. Create JSON config in `src/content/adventures/adventure-name-language.json`
2. Add images to `src/assets/images/adventures/adventure-name/`
3. Add slider images to `src/assets/images/adventures/sliders/adventure-name-language/`
4. Add PDF brochure to `src/assets/docs/adventures/`
5. Create page directory `src/pages/aventuras/adventure-name/`
6. Create language variant pages:
   ```astro
   ---
   import AdventureContentLayout from '../../../layouts/AdventureContentLayout.astro';
   import config from '../../../content/adventures/adventure-name-espanol.json';
   ---
   <AdventureContentLayout
     title={config.title}
     description={config.description}
     config={config}
     lang="es"
     currentAdventure="adventure-name"
   />
   ```

### Image Optimization

Astro automatically optimizes images imported from `src/assets/`:
- Generates responsive sizes
- Converts to WebP/AVIF
- Adds lazy loading
- Cache busting with hashes

**Recommendations**:
- Landscape images: 1920x1080px, 2-3MB max
- Portrait images: 1080x1920px, 2-3MB max
- Use descriptive names: `plaza-principal.jpg` not `IMG_001.jpg`

### Content Management Notes

- **Before build**: All images, PDFs, and media must be in place (processed at build time)
- **Public folder**: Static files that need direct URL access (fonts, public PDFs)
- **Assets folder**: Files that should be processed by Astro (images, docs referenced in content)
- **CSV Locations**: `locaciones_ofi_virtual.csv` contains coordinates for all virtual office locations

### Accessibility Features

The site includes multiple accessibility formats for adventures:
- **Español**: Standard Spanish
- **Lectura Fácil**: Easy reading format (simplified language)
- **Descriptivo**: Descriptive format (audio descriptions)
- **Signoguía**: Sign language guide
- **Inglés**: English translation

Each variant has its own JSON config and page.

## Git Workflow

**Current branch**: master
**No main branch detected** - use `master` as the base branch for PRs and comparisons.

### Recent Commit Patterns
Commits focus on UI fixes, slider functionality, modal improvements, and brochure text updates. Commit messages are concise and describe the change.
