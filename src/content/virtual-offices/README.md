# Virtual Office Layout System

Sistema reutilizable para crear páginas de oficinas virtuales con contenido configurable y secciones opcionales.

## 📁 Estructura

```
src/
├── content/
│   ├── config.ts                    # Schema de content collections
│   └── virtual-offices/             # Contenidos de oficinas virtuales
│       ├── oficina-turismo.json     # Ejemplo: Oficina de Turismo
│       ├── oficina-cultura.json     # Ejemplo: Oficina de Cultura
│       └── [tu-oficina].json        # Tus propios contenidos
├── layouts/
│   └── VirtualOfficeLayout.astro    # Layout reutilizable
└── pages/
    ├── ofi_virtual.astro            # Página de Oficina de Turismo
    ├── ofi_cultura.astro            # Página de Oficina de Cultura
    └── [tu-pagina].astro            # Tus propias páginas
```

## 🚀 Uso Rápido

### 1. Crear un nuevo contenido

Crea un archivo JSON en `src/content/virtual-offices/`:

```json
{
  "title": "Mi Oficina Virtual",
  "description": "Descripción de mi oficina",
  "lang": "es",

  "hero": {
    "visible": true,
    "title": "Título Principal",
    "subtitle": "Subtítulo",
    "videoUrl": "/videos/mi-video.mp4"
  },

  "lecturaFacil": {
    "visible": false
  },

  // ... más secciones
}
```

### 2. Crear una página

Crea un archivo en `src/pages/`:

```astro
---
import { getEntry } from 'astro:content';
import VirtualOfficeLayout from '../layouts/VirtualOfficeLayout.astro';

const config = await getEntry('virtual-offices', 'mi-oficina');
---

<VirtualOfficeLayout config={config.data} />
```

## 📋 Secciones Disponibles

### 1. Hero (Video de portada)
```json
"hero": {
  "visible": true,
  "videoUrl": "/videos/mi-video.mp4",
  "posterUrl": "/images/poster.jpg",
  "title": "Título Principal",
  "subtitle": "Subtítulo descriptivo"
}
```

### 2. Lectura Fácil
```json
"lecturaFacil": {
  "visible": true,
  "title": "Lectura Fácil",
  "pdfUrl": "/pdfs/lectura-facil.pdf",
  "buttonText": "Descargar información",
  "content": [
    {
      "emoji": "📍",
      "text": "Texto explicativo simple y claro"
    }
  ]
}
```

### 3. Mapa
```json
"mapa": {
  "visible": true,
  "title": "¿Dónde estamos?",
  "subtitle": "Ubicación",
  "locations": [
    {
      "name": "Nombre del lugar",
      "description": "Descripción",
      "coordinates": [40.9505, -5.6300]
    }
  ],
  "direccion": {
    "calle": "Calle Principal, 123",
    "codigoPostal": "37900 Ciudad",
    "ciudad": "Provincia"
  },
  "comoLlegar": [
    {
      "emoji": "🚌",
      "text": "Bus: Líneas 1, 2, 3"
    }
  ]
}
```

### 4. Banner CTA (Llamada a la acción)
```json
"bannerCTA": {
  "visible": true,
  "link": "/destino",
  "emoji": "🎧",
  "title": "Título del Banner",
  "subtitle": "Descripción del enlace",
  "bgGradient": "from-blue-600 to-purple-600"
}
```

### 5. Información y Horarios
```json
"infoHorarios": {
  "visible": true,
  "title": "Información y Horarios",
  "subtitle": "Te esperamos",
  "horarios": {
    "temporadaAlta": {
      "periodo": "(Julio - Septiembre)",
      "horario": [
        "Lunes a Viernes: 10:00 - 14:00",
        "Sábados: 10:00 - 14:00"
      ]
    },
    "temporadaBaja": {
      "periodo": "(Octubre - Junio)",
      "horario": ["Lunes a Viernes: 9:00 - 13:00"]
    },
    "festivos": "Cerrado"
  },
  "servicios": [
    {
      "emoji": "📱",
      "title": "Servicio Digital",
      "description": "Descripción del servicio"
    }
  ],
  "contacto": {
    "telefono": "923 000 000",
    "email": "contacto@ejemplo.com"
  }
}
```

### 6. Actividades
```json
"actividades": {
  "visible": true,
  "title": "Actividades Disponibles",
  "subtitle": "Descubre más",
  "items": [
    {
      "emoji": "🎨",
      "title": "Arte",
      "subtitle": "Descripción breve",
      "link": "/arte",
      "gradient": "from-blue-500 to-blue-700"
    }
  ]
}
```

## 🎨 Gradientes Disponibles (Tailwind CSS)

- `from-SM-blue to-blue-700` - Azul institucional
- `from-SM-yellow to-yellow-600` - Amarillo institucional
- `from-green-500 to-green-700` - Verde
- `from-purple-600 to-pink-600` - Morado/Rosa
- `from-orange-500 to-red-600` - Naranja/Rojo
- `from-blue-500 to-indigo-600` - Azul/Índigo

## 🔧 Opciones de Visibilidad

Cada sección tiene un campo `visible`:
- `true`: La sección se muestra
- `false`: La sección se oculta completamente

Ejemplo para ocultar el mapa:
```json
"mapa": {
  "visible": false
}
```

## 📝 Notas Importantes

1. **Campos opcionales**: Si una sección tiene `visible: false`, no necesitas llenar sus datos
2. **Orden de las secciones**: Las secciones se renderizan en este orden:
   1. Hero
   2. Lectura Fácil
   3. Mapa
   4. Banner CTA
   5. Info y Horarios
   6. Actividades
3. **Idioma**: Usa el campo `lang` para establecer el idioma (por defecto: "es")
4. **Coordenadas**: El formato es `[latitud, longitud]`

## 🆕 Crear Nueva Oficina Virtual

1. **Copia** uno de los archivos JSON de ejemplo
2. **Modifica** el contenido según tus necesidades
3. **Oculta** las secciones que no necesites con `"visible": false`
4. **Crea** una página en `src/pages/` que use el layout
5. **Listo** - tu oficina virtual está funcionando

## 🐛 Solución de Problemas

### La página no se renderiza
- Verifica que el nombre del archivo JSON coincida con el usado en `getEntry()`
- Asegúrate de que el JSON sea válido (usa un validador online)

### Las imágenes/videos no se muestran
- Verifica que las rutas sean correctas
- Los archivos deben estar en la carpeta `public/`

### El mapa no aparece
- Verifica que las coordenadas sean correctas: `[latitud, longitud]`
- Asegúrate de que `MapComponent` esté importado correctamente

## 💡 Ejemplos

Ver los archivos de ejemplo:
- **Oficina completa**: `oficina-turismo.json` (todas las secciones visibles)
- **Oficina simplificada**: `oficina-cultura.json` (sin sección de mapa)
