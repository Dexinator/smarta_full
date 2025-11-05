# Guía de Testing de Accesibilidad
## Santa Marta Full

Esta guía proporciona instrucciones detalladas para probar la accesibilidad del sitio web Santa Marta Full con usuarios con discapacidad visual.

---

## Tabla de Contenidos

1. [Herramientas Necesarias](#herramientas-necesarias)
2. [Testing con Lectores de Pantalla](#testing-con-lectores-de-pantalla)
3. [Testing con Teclado](#testing-con-teclado)
4. [Auditoría Automatizada](#auditoría-automatizada)
5. [Checklist de Verificación](#checklist-de-verificación)
6. [Problemas Comunes](#problemas-comunes)

---

## Herramientas Necesarias

### Lectores de Pantalla

#### Windows
- **NVDA** (recomendado - gratuito)
  - Descargar: https://www.nvaccess.org/download/
  - Atajos: Insert + tecla modificadora
  - Configuración idioma: Preferencias → Voz → Seleccionar sintetizador español

- **JAWS** (comercial)
  - Descargar: https://www.freedomscientific.com/products/software/jaws/
  - Atajos: Insert + tecla modificadora
  - Muy utilizado profesionalmente

#### macOS / iOS
- **VoiceOver** (integrado)
  - Activar: Cmd + F5 (macOS) o triple clic en botón inicio (iOS)
  - Atajos: Control + Option + tecla modificadora
  - Configuración español: Preferencias del Sistema → Accesibilidad → VoiceOver

#### Android
- **TalkBack** (integrado)
  - Activar: Ajustes → Accesibilidad → TalkBack
  - Atajos: Gestos táctiles
  - Cambiar idioma: Ajustes → Accesibilidad → Text-to-speech

### Herramientas de Auditoría

1. **axe DevTools** (Extensión de navegador - gratuita)
   - Chrome: https://chrome.google.com/webstore (buscar "axe DevTools")
   - Firefox: https://addons.mozilla.org/firefox/addon/axe-devtools/

2. **Lighthouse** (Integrado en Chrome DevTools)
   - F12 → pestaña "Lighthouse" → Seleccionar "Accessibility" → Generate report

3. **WAVE** (Extensión de navegador)
   - https://wave.webaim.org/extension/

---

## Testing con Lectores de Pantalla

### Preparación

1. **Iniciar el lector de pantalla**
   - NVDA: Control + Alt + N
   - JAWS: Iniciar aplicación JAWS
   - VoiceOver: Cmd + F5
   - TalkBack: Desde Ajustes de accesibilidad

2. **Abrir el sitio web**
   - Navegar a: https://santamartafull.com (o tu URL de desarrollo)

3. **Cerrar los ojos** (opcional pero recomendado)
   - Te ayuda a experimentar la web como un usuario ciego real

---

### Test 1: Navegación por Landmarks

**Objetivo**: Verificar que las regiones principales sean identificables

**NVDA/JAWS**: Insert + F7 → Elementos → Regiones
**VoiceOver**: Control + Option + U → Landmarks

**Verificar**:
- [x] Se detecta `<header>` / banner
- [x] Se detecta `<nav>` / navigation
- [x] Se detecta `<main>` / main
- [x] Se detecta `<footer>` / contentinfo
- [x] Las secciones tienen labels descriptivos (ej: "Navegación principal")

---

### Test 2: Skip Links

**Objetivo**: Verificar que se puede saltar al contenido principal

**Pasos**:
1. Cargar la página
2. Presionar Tab una vez
3. Debería aparecer "Saltar al contenido principal" (español) o "Skip to main content" (inglés)
4. Presionar Enter
5. El foco debe saltar al contenido principal

**Resultado esperado**: El lector de pantalla debe anunciar el primer elemento del contenido principal

---

### Test 3: Navegación del Menú

**Objetivo**: Verificar la navegación principal

**Pasos**:
1. Navegar al menú de navegación (Insert + F7 → Navegación)
2. Usar flechas arriba/abajo para navegar entre enlaces
3. En móvil: verificar botón hamburguesa con aria-expanded

**Verificar**:
- [x] Enlaces anuncian su destino claramente
- [x] El lector anuncia "¿Qué visitar?", "Audioguías", "Aventuras"
- [x] El enlace activo tiene identificación especial
- [x] Botón hamburguesa anuncia si está expandido o colapsado

---

### Test 4: Logos y Enlaces

**Objetivo**: Verificar que los logos son accesibles

**NVDA/JAWS**: Insert + F7 → Enlaces
**VoiceOver**: Control + Option + U → Links

**Verificar**:
- [x] Logo principal anuncia "Ir a la página principal de Santa Marta de Tormes"
- [x] Logo turismo anuncia "Visitar web..." y "(se abre en nueva pestaña)"
- [x] No hay duplicación de información entre alt text y aria-label
- [x] Imágenes decorativas son ignoradas (alt="" con role="presentation")

---

### Test 5: Mapas Interactivos

**Objetivo**: Verificar accesibilidad del componente de mapa

**Ubicación**: Páginas de oficinas virtuales, páginas de aventuras

**Pasos**:
1. Navegar al mapa con Tab
2. El lector debe anunciar: "Mapa interactivo de ubicaciones. X ubicaciones. Mapa bloqueado..."
3. Presionar en botón "Desbloquear mapa"
4. El lector debe anunciar: "Mapa desbloqueado"
5. Navegar por los marcadores con Tab

**Verificar**:
- [x] El mapa tiene role="application" con aria-label descriptivo
- [x] Botón desbloquear tiene aria-pressed correcto (true/false)
- [x] Los marcadores anuncian su ubicación con nombre y coordenadas
- [x] Enlaces "Cómo llegar" indican que abren Google Maps
- [x] Los cambios de estado se anuncian automáticamente

---

### Test 6: Reproductor de Video

**Objetivo**: Verificar accesibilidad del video hero

**Ubicación**: Páginas de oficinas virtuales

**Pasos**:
1. Navegar a los controles del video con Tab
2. Verificar botones: Play/Pause, Mute/Unmute, Fullscreen
3. En fullscreen: verificar barra de progreso
4. Usar flechas izquierda/derecha en la barra de progreso

**Verificar**:
- [x] Botones anuncian su función claramente
- [x] Play/Pause cambia el anuncio según el estado
- [x] Mute tiene aria-pressed correcto
- [x] Los cambios de estado se anuncian (ej: "Reproducir video")
- [x] Barra de progreso tiene role="slider" con valores min/max/now
- [x] Navegación por teclado funciona en barra de progreso
- [x] Se anuncia tiempo actual y duración (ej: "1:23 de 3:45")

---

### Test 7: Galería de Imágenes

**Objetivo**: Verificar accesibilidad de galerías en aventuras

**Ubicación**: Páginas de aventuras (ej: Santa MartaXplora)

**Pasos**:
1. Navegar a la galería con Tab
2. El lector debe anunciar: "Galería de imágenes de la aventura"
3. Usar botones anterior/siguiente con Tab
4. Presionar en indicadores (dots) para cambiar de imagen
5. Verificar botones de audio/video si existen

**Verificar**:
- [x] La galería tiene role="region" con aria-label
- [x] Cada slide anuncia "Imagen X de Y: [descripción]"
- [x] Botones prev/next anuncian "Imagen anterior" / "Imagen siguiente"
- [x] Indicadores anuncian "Ir a imagen X: [descripción]"
- [x] Botones de media anuncian "Escuchar audio sobre:" o "Ver video sobre:"
- [x] Los cambios de slide se anuncian automáticamente con LiveRegion
- [x] Botón fullscreen indica su función

---

### Test 8: Controles de Accesibilidad

**Objetivo**: Verificar controles globales en header

**Ubicación**: Header (siempre visible en móvil)

**Pasos**:
1. Navegar al header con Tab
2. Verificar selector de idioma
3. Verificar botones de modo claro/oscuro
4. Verificar botón de alto contraste
5. Verificar botones A+/A- para tamaño de fuente

**Verificar**:
- [x] Cada botón anuncia su función claramente
- [x] Emojis (🔆 🌙) tienen aria-hidden="true"
- [x] SVG de alto contraste tiene aria-hidden="true"
- [x] Los cambios se aplican correctamente al activar los controles

---

### Test 9: Formularios y Modales

**Objetivo**: Verificar modales de audio/video

**Ubicación**: Al hacer clic en botones de media en galerías

**Pasos**:
1. Abrir un modal de audio o video
2. Verificar que el foco va al modal
3. Verificar controles del reproductor
4. Presionar Escape o botón cerrar
5. Verificar que el foco regresa al elemento que abrió el modal

**Verificar**:
- [x] Modal tiene role="dialog" con aria-modal="true"
- [x] Modal tiene aria-labelledby y aria-describedby
- [x] El foco queda atrapado dentro del modal
- [x] Escape cierra el modal
- [x] Al cerrar, el foco regresa al botón que lo abrió
- [x] Controles del reproductor son accesibles
- [x] Estados de carga se anuncian con role="status"

---

### Test 10: Carruseles/Sliders

**Objetivo**: Verificar carruseles de partners y aventuras

**Ubicación**: Footer (partners), home (aventuras móvil)

**Pasos**:
1. Navegar al carrusel con Tab
2. Usar botones prev/next
3. Verificar indicadores (dots)
4. En móvil: deslizar con gestos de toque

**Verificar**:
- [x] Carrusel tiene estructura accesible (role="region" o similar)
- [x] Botones prev/next anuncian su función
- [x] Indicadores anuncian qué slide representan
- [x] Los cambios de slide se anuncian automáticamente
- [x] Nombre del partner actual es anunciado

---

## Testing con Teclado

### Teclas Básicas

- **Tab**: Navegar hacia adelante
- **Shift + Tab**: Navegar hacia atrás
- **Enter**: Activar enlaces y botones
- **Espacio**: Activar botones, checkboxes
- **Flechas**: Navegar en controles complejos (sliders, tabs, menús)
- **Escape**: Cerrar modales y menús

### Test de Navegación Completa

**Objetivo**: Verificar que TODO es accesible con teclado

**Pasos**:
1. Cargar la página
2. Presionar Tab repetidamente desde el inicio hasta el final
3. Verificar que el foco siempre es visible
4. Verificar que nada se queda "atrapado" (focus trap no intencional)
5. Intentar activar todos los elementos interactivos solo con teclado

**Checklist**:
- [ ] ✓ Skip link funciona (Tab → Enter)
- [ ] ✓ Todos los enlaces son alcanzables
- [ ] ✓ Todos los botones son alcanzables
- [ ] ✓ Menú móvil se puede abrir/cerrar
- [ ] ✓ Controles de video funcionan
- [ ] ✓ Galería de imágenes se puede navegar
- [ ] ✓ Mapas son parcialmente navegables (marcadores)
- [ ] ✓ Modales se pueden cerrar con Escape
- [ ] ✓ Carruseles se pueden navegar
- [ ] ✓ Formularios se pueden completar
- [ ] ✓ El foco nunca desaparece
- [ ] ✓ El foco es siempre visible (anillo de enfoque)

---

## Auditoría Automatizada

### Con axe DevTools

1. Abrir Chrome DevTools (F12)
2. Ir a pestaña "axe DevTools"
3. Click en "Scan ALL of my page"
4. Revisar resultados:
   - **Critical**: Debe ser 0
   - **Serious**: Debe ser 0 o muy pocos
   - **Moderate**: Revisar y corregir si es posible
   - **Minor**: Notas informativas

**Páginas a auditar**:
- [ ] Home (español) - `/`
- [ ] Home (inglés) - `/en`
- [ ] Oficina Virtual Arte - `/ofi_arte`
- [ ] Oficina Virtual Natural - `/ofi_natural`
- [ ] Oficina Virtual Motera - `/ofi_motera`
- [ ] Oficina Virtual Familiar - `/ofi_familiar`
- [ ] Aventura Santa MartaXplora (español) - `/aventuras/santa-martaxplora/espanol`
- [ ] Aventura Santa MartaXplora (inglés) - `/aventuras/santa-martaxplora/ingles`
- [ ] Aventura Urban Escape - `/aventuras/urban-escape`
- [ ] Aventura Detectives - `/aventuras/detectives/espanol`

### Con Lighthouse

1. Abrir Chrome DevTools (F12)
2. Ir a pestaña "Lighthouse"
3. Seleccionar "Accessibility"
4. Click en "Generate report"
5. Objetivo: **Score ≥ 95/100**

**Métricas clave**:
- [ ] Names and labels - 100%
- [ ] Contrast - 100%
- [ ] Navigation - 100%
- [ ] ARIA - 100%
- [ ] Tables and lists - 100%

### Con WAVE

1. Instalar extensión WAVE
2. Navegar a la página
3. Click en ícono de WAVE
4. Revisar:
   - **Errors** (rojo): Debe ser 0
   - **Contrast Errors**: Debe ser 0
   - **Alerts** (amarillo): Revisar y justificar
   - **Features** (verde): Indicadores de buenas prácticas
   - **Structural Elements**: Verificar jerarquía
   - **ARIA**: Verificar uso correcto

---

## Checklist de Verificación

### Global

- [ ] Skip links presentes y funcionales
- [ ] Idioma del documento especificado (`<html lang="es">` o `lang="en"`)
- [ ] Títulos de página descriptivos
- [ ] Estructura de encabezados lógica (H1 → H2 → H3)
- [ ] Contraste de color cumple WCAG AA (4.5:1 texto normal, 3:1 texto grande)
- [ ] Foco visible en todos los elementos interactivos
- [ ] Sin focus traps no intencionales
- [ ] Navegación con teclado completa

### Imágenes

- [ ] Todas las imágenes tienen alt text o alt=""
- [ ] Alt text es descriptivo y conciso
- [ ] Imágenes decorativas tienen alt="" y role="presentation"
- [ ] Imágenes complejas tienen descripciones largas si es necesario
- [ ] Iconos SVG decorativos tienen aria-hidden="true"
- [ ] Iconos SVG funcionales tienen aria-label o title

### Enlaces

- [ ] Enlaces tienen texto descriptivo (no "click aquí")
- [ ] Enlaces externos indican que se abren en nueva pestaña
- [ ] Enlaces tienen estados :hover, :focus, :active visibles
- [ ] Enlaces tienen rel="noopener noreferrer" si target="_blank"

### Botones

- [ ] Botones tienen aria-label si el texto no es suficiente
- [ ] Botones toggle tienen aria-pressed
- [ ] Botones con estado tienen aria-expanded o aria-selected
- [ ] Botones con íconos decorativos tienen aria-hidden en el ícono

### Formularios

- [ ] Todos los inputs tienen labels asociados
- [ ] Errores de validación son anunciados
- [ ] Campos requeridos están indicados
- [ ] Instrucciones son accesibles

### Multimedia

- [ ] Videos tienen controles accesibles
- [ ] Controles tienen aria-label descriptivos
- [ ] Barras de progreso tienen role="slider"
- [ ] Estados de carga tienen role="status"
- [ ] Los cambios se anuncian con live regions

### Navegación

- [ ] Menú principal tiene role="navigation"
- [ ] Página actual tiene aria-current="page"
- [ ] Menú móvil tiene aria-expanded
- [ ] Breadcrumbs tienen estructura correcta

### Contenido Dinámico

- [ ] Live regions para anuncios (role="status" o "alert")
- [ ] Modales tienen role="dialog" y aria-modal="true"
- [ ] Tooltips tienen aria-describedby
- [ ] Carruseles anuncian cambios de slide
- [ ] Notificaciones son anunciadas

---

## Problemas Comunes

### 1. Imágenes sin alt text
**Síntoma**: Lector dice "image" sin descripción
**Solución**: Agregar `alt="descripción"` o `alt=""` si es decorativa

### 2. Botones sin aria-label
**Síntoma**: Lector dice "button" sin propósito
**Solución**: Agregar `aria-label="Descripción de la acción"`

### 3. Emojis leídos en voz alta
**Síntoma**: Lector dice "sun emoji" "moon emoji"
**Solución**: Envolver en `<span aria-hidden="true">🔆</span>`

### 4. Enlaces no descriptivos
**Síntoma**: Lector dice "link click here"
**Solución**: Usar texto descriptivo o agregar `aria-label`

### 5. Modales sin focus trap
**Síntoma**: Tab sale del modal
**Solución**: Implementar focus trap con JavaScript

### 6. Cambios sin anunciar
**Síntoma**: El contenido cambia pero el lector no lo anuncia
**Solución**: Usar `role="status" aria-live="polite"` o LiveRegion

### 7. Contraste insuficiente
**Síntoma**: WAVE/Lighthouse reporta error de contraste
**Solución**: Ajustar colores para cumplir ratio 4.5:1

### 8. Orden de tab ilógico
**Síntoma**: Tab salta de forma confusa
**Solución**: Evitar `tabindex` positivos, revisar orden del DOM

### 9. Skip link no funciona
**Síntoma**: Skip link no mueve el foco
**Solución**: Verificar que target tiene `tabindex="-1"` si no es focuseable

### 10. ARIA mal usado
**Síntoma**: Lector anuncia cosas incorrectas
**Solución**: Verificar que los roles, states y properties son correctos

---

## Recursos Adicionales

### Documentación

- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/resources/
- **MDN Web Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility

### Herramientas

- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Color Palette**: https://coolors.co/contrast-checker
- **HTML Validator**: https://validator.w3.org/
- **Screen Reader emulator**: https://silktide.com/resources/toolbar/

### Comunidad

- **A11Y Project**: https://www.a11yproject.com/
- **WebAIM Forums**: https://webaim.org/discussion/
- **Inclusive Components**: https://inclusive-components.design/

---

## Contacto

Para reportar problemas de accesibilidad o solicitar ayuda:

- **Issues**: https://github.com/[tu-repo]/issues
- **Email**: accesibilidad@santamarta.com (ejemplo)

---

**Última actualización**: 2025-11-05
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo Santa Marta Full
