# 📄 Documentos PDF

Esta carpeta contiene los documentos PDF para descargas en la aplicación.

## Estructura de Carpetas

```
docs/
└── adventures/
    ├── santa-marta-adventure-es.pdf
    ├── santa-marta-adventure-en.pdf
    ├── urban-escape-es.pdf
    └── [nombre-aventura].pdf
```

## Recomendaciones

### Tamaño de Archivos
- **Tamaño máximo recomendado**: 5MB
- **Tamaño ideal**: 1-3MB
- Para archivos más grandes, considera usar compresión PDF

### Optimización de PDFs
Herramientas recomendadas para comprimir PDFs:
- Adobe Acrobat (Guardar como PDF optimizado)
- SmallPDF (online)
- ILovePDF (online)
- Ghostscript (línea de comandos)

### Nomenclatura
- Usa nombres descriptivos: `santa-marta-adventure-es.pdf`
- Incluye el idioma si tienes múltiples versiones: `-es`, `-en`
- Evita espacios y caracteres especiales
- Usa guiones para separar palabras

### Contenido Recomendado para Folletos

Un buen folleto de aventura debe incluir:
1. **Portada** con título e imagen atractiva
2. **Mapa** con los puntos de interés
3. **Instrucciones** de la aventura
4. **Descripciones** de cada punto/pista
5. **Información práctica**: horarios, precios, contacto
6. **Códigos QR** para enlaces a audio/video (opcional)
7. **Información de accesibilidad**

## Integración con el Template

Para usar un PDF en el template de aventuras:

1. Coloca el PDF en `src/assets/docs/adventures/`
2. En el archivo JSON de configuración, especifica la ruta:

```json
"downloadBrochure": {
  "visible": true,
  "pdfPath": "adventures/nombre-archivo.pdf",
  ...
}
```

La ruta es relativa a `src/assets/docs/`

## Manejo Automático

Astro procesará estos PDFs durante el build para:
- Generar URLs con hash para cache busting
- Optimizar la entrega del archivo
- Mantener la integridad del archivo

## Nota Importante

Los PDFs deben ser colocados aquí ANTES de ejecutar el build de Astro, ya que son procesados durante el tiempo de construcción.