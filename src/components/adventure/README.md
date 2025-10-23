# 🎮 Template de Aventuras - Guía de Uso

Este template permite crear páginas de aventuras interactivas con galerías de imágenes optimizadas, reproductores de audio/video, mapas interactivos y descargas de folletos.

## 📁 Estructura de Archivos

```
src/
├── assets/
│   ├── images/
│   │   └── adventures/
│   │       └── [nombre-aventura]/  # Imágenes de cada aventura
│   │           ├── pista-1.jpg
│   │           ├── pista-2.jpg
│   │           └── ...
│   └── docs/
│       └── adventures/             # PDFs de folletos
│           └── [nombre-aventura].pdf
├── content/
│   └── adventures/
│       └── [nombre-aventura].json  # Configuración de la aventura
├── pages/
│   └── aventuras/
│       └── [nombre-aventura]/
│           └── index.astro          # Página de la aventura
└── layouts/
    └── AdventureContentLayout.astro # Layout principal
```

## 🚀 Crear una Nueva Aventura

### Paso 1: Preparar los Assets

#### Imágenes
- Coloca las imágenes en `src/assets/images/adventures/[nombre-aventura]/`
- Formatos soportados: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`
- Recomendaciones:
  - **Landscape (16:9)**: Mínimo 1920x1080px
  - **Portrait (9:16)**: Mínimo 1080x1920px
  - Las imágenes serán automáticamente optimizadas por Astro

#### PDFs
- Coloca los PDFs en `src/assets/docs/adventures/`
- Nombra el archivo de manera descriptiva: `santa-marta-adventure.pdf`

### Paso 2: Crear Archivo de Configuración JSON

Crea un archivo en `src/content/adventures/[nombre-aventura].json`:

```json
{
  "title": "Título de la Aventura",
  "description": "Descripción de la aventura",
  "imageGallery": {
    "visible": true,
    "orientation": "landscape", // o "portrait"
    "images": [
      {
        "src": "nombre-carpeta/imagen1.jpg", // Ruta relativa desde adventures/
        "alt": "Descripción de la imagen para accesibilidad",
        "mediaButton": {  // Opcional - para audio o video
          "type": "audio", // o "video"
          "url": "https://soundcloud.com/...",
          "label": "Texto del botón de reproducción"
        }
      }
    ]
  },
  "map": {
    "visible": true,
    "center": [11.2403547, -74.2110227], // Opcional, se calcula automáticamente
    "zoom": 14,
    "locations": [
      {
        "coordinates": [11.2403547, -74.2110227],
        "name": "Nombre del lugar",
        "description": "Descripción del lugar" // Opcional
      }
    ]
  },
  "downloadBrochure": {
    "visible": true,
    "title": "Descargar Folleto",
    "description": "Descripción del folleto",
    "pdfPath": "adventures/nombre-archivo.pdf", // Ruta relativa desde src/assets/docs/
    "buttonText": "Descargar PDF" // Opcional
  },
  "otherAdventures": {
    "visible": true,
    "adventures": [
      {
        "title": "Nombre de otra aventura",
        "link": "/aventuras/ruta-aventura",
        "image": "carpeta/imagen.jpg" // Ruta relativa desde src/assets/images/adventures/
      }
    ]
  }
}
```

### Paso 3: Crear la Página Astro

Crea un archivo en `src/pages/aventuras/[nombre-aventura]/index.astro`:

```astro
---
import AdventureContentLayout from '../../../layouts/AdventureContentLayout.astro';
import adventureConfig from '../../../content/adventures/[nombre-aventura].json';
---

<AdventureContentLayout
  title={adventureConfig.title}
  description={adventureConfig.description}
  config={adventureConfig}
/>
```

## 🎨 Características del Template

### Optimización de Imágenes
- ✅ Conversión automática a WebP
- ✅ Múltiples tamaños para responsive (srcset)
- ✅ Lazy loading automático
- ✅ Fallback a JPEG para compatibilidad
- ✅ Cache busting con hash en nombres

### Galería de Imágenes
- 📱 Carousel con swipe en móviles
- 🖱️ Navegación con botones en desktop
- 🔢 Indicadores de puntos
- ⌨️ Navegación con teclado
- 🎵 Botones opcionales para audio/video

### Reproductores de Media
- 🎵 **SoundCloud**: Integración con controles personalizados
- 🎬 **Vimeo**: Reproductor con pantalla completa
- 🎮 Controles simplificados y accesibles
- 📱 Optimizado para móviles

### Mapa Interactivo
- 📍 Múltiples ubicaciones con pines
- 🔒 Bloqueo/desbloqueo de scroll
- 📝 Popups con información
- 🗺️ Enlaces a Google Maps

### Accesibilidad
- ♿ ARIA labels completos
- ⌨️ Navegación por teclado
- 🔗 Skip links
- 📱 Focus trap en modales
- 👁️ Alt text en todas las imágenes

### Otras Aventuras (Burbujas)
- 🎮 Sección de aventuras relacionadas
- 🟣 Burbujas circulares con imágenes
- 🔗 Enlaces a otras aventuras del sitio
- 📱 Grid responsive
- 🎯 Personalizable por página

## 📝 Configuración Avanzada

### Secciones Opcionales

Todas las secciones son opcionales. Para ocultar una sección, establece `visible: false`:

```json
{
  "imageGallery": {
    "visible": false  // Oculta la galería
  },
  "map": {
    "visible": true   // Muestra el mapa
  },
  "downloadBrochure": {
    "visible": false  // Oculta la descarga
  }
}
```

### Orientación de Imágenes

- **"landscape"**: Para imágenes 16:9 (horizontal)
- **"portrait"**: Para imágenes 9:16 (vertical, móvil)

### URLs de Media

- **SoundCloud**: Usa la URL pública del track
- **Vimeo**: Usa la URL del video (soporta videos privados con hash)

## 🔧 Solución de Problemas

### Las imágenes no se muestran
- Verifica que las rutas en el JSON coincidan con la estructura de carpetas
- Asegúrate de que las imágenes estén en `src/assets/images/adventures/`
- Revisa la consola del navegador para mensajes de error

### El PDF no se descarga
- Verifica que el archivo PDF esté en `src/assets/docs/adventures/`
- Comprueba que la ruta en `pdfPath` sea correcta

### El audio/video no se reproduce
- Verifica que las URLs de SoundCloud/Vimeo sean públicas
- Revisa la consola para errores de CORS o permisos

## 📚 Ejemplo Completo

Ver `/src/pages/aventuras/ejemplo/` para un ejemplo funcional completo con:
- 6 imágenes con botones de media
- 6 ubicaciones en el mapa
- Descarga de folleto PDF
- Todos los textos en español

## 🎯 Tipos de Aventura

Cada aventura está diseñada para un tipo específico de contenido:
- **Audio Español**: Aventuras con narración en español
- **Audio Lectura Fácil**: Versión simplificada con lenguaje sencillo
- **Audio Descriptivo**: Para personas con discapacidad visual
- **Video LSE**: En Lengua de Señas Española
- **Audio English**: Versión en inglés para turistas

Cada tipo de aventura tiene su propia página independiente con todo el contenido en el idioma correspondiente.

## 🎯 Mejores Prácticas

1. **Imágenes**: Usa imágenes de alta calidad pero optimizadas (2-3MB máximo antes de procesamiento)
2. **Alt Text**: Proporciona descripciones detalladas para accesibilidad
3. **PDFs**: Mantén los PDFs bajo 5MB para descargas rápidas
4. **Mapas**: No agregues más de 10-15 pines para mantener la claridad
5. **Media**: Usa URLs directas de SoundCloud/Vimeo, no embeds

## 🤝 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.