# 📸 Imágenes de Aventuras

Esta carpeta contiene las imágenes para las diferentes aventuras.

## Estructura de Carpetas

```
adventures/
├── santa-marta/
│   ├── pista-1.jpg
│   ├── pista-2.jpg
│   ├── pista-3.jpg
│   ├── pista-4.jpg
│   ├── pista-5.jpg
│   └── final.jpg
├── urban-escape/
│   ├── inicio.jpg
│   ├── mural-1.jpg
│   ├── mural-2.jpg
│   └── ...
└── [nombre-aventura]/
    └── [imagenes].jpg
```

## Recomendaciones de Tamaño

### Imágenes Horizontales (landscape)
- **Resolución recomendada**: 1920x1080px (16:9)
- **Tamaño máximo de archivo**: 2-3MB
- **Formatos soportados**: JPG, PNG, WebP, AVIF

### Imágenes Verticales (portrait)
- **Resolución recomendada**: 1080x1920px (9:16)
- **Tamaño máximo de archivo**: 2-3MB
- **Formatos soportados**: JPG, PNG, WebP, AVIF

## Optimización Automática

Astro procesará automáticamente estas imágenes para:
- Generar múltiples tamaños (responsive)
- Convertir a WebP para navegadores modernos
- Aplicar compresión inteligente
- Añadir lazy loading
- Generar hash para cache busting

## Nomenclatura Recomendada

- Usa nombres descriptivos: `plaza-principal.jpg` en lugar de `IMG_001.jpg`
- Evita espacios y caracteres especiales
- Usa guiones para separar palabras
- Mantén los nombres en minúsculas

## Placeholder para Desarrollo

Si necesitas imágenes de prueba mientras desarrollas, puedes usar servicios como:
- https://picsum.photos/1920/1080 (landscape)
- https://picsum.photos/1080/1920 (portrait)
- https://placeholder.com/1920x1080

## Nota Importante

Las imágenes deben ser colocadas aquí ANTES de ejecutar el build de Astro, ya que son procesadas durante el tiempo de construcción.