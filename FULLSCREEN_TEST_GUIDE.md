# Guía de Prueba - Pantalla Completa en Móviles

## Resumen de Cambios

He actualizado el componente `VimeoHeroPlayer` para mejorar la compatibilidad de pantalla completa en dispositivos móviles, especialmente iOS Safari.

### Mejoras Implementadas:

1. **Detección mejorada de soporte de fullscreen**
   - Verifica todos los prefijos de navegador (webkit, moz, ms)
   - Detecta específicamente dispositivos iOS

2. **Múltiples métodos de fallback**
   - Intenta el API estándar de fullscreen
   - Usa prefijos específicos del navegador
   - Intenta fullscreen nativo de Vimeo Player
   - Para iOS: intenta métodos webkit específicos

3. **Solución alternativa para iOS**
   - Si fullscreen no está soportado en iOS, el botón abre el video en Vimeo.com
   - Indicador visual (punto amarillo pulsante) para mostrar que es un enlace externo

## Cómo Probar

### En Android (Chrome, Firefox, Edge)
1. Navega a una página con video (ej: `/ofi_arte`)
2. Toca el botón de pantalla completa (icono con 4 flechas)
3. El video debería expandirse a pantalla completa
4. Toca el botón X rojo para salir

### En iOS Safari
1. Navega a una página con video
2. Observa el botón de pantalla completa:
   - Si aparece con un punto amarillo pulsante = abrirá en Vimeo
   - Si aparece normal = intenta fullscreen nativo
3. Toca el botón para probar

### Dispositivos de Prueba Recomendados
- [ ] iPhone (Safari)
- [ ] iPhone (Chrome)
- [ ] iPad (Safari)
- [ ] Android Phone (Chrome)
- [ ] Android Phone (Firefox)
- [ ] Android Tablet (Chrome)

## Comportamiento Esperado por Navegador

| Dispositivo/Navegador | Comportamiento Esperado |
|----------------------|-------------------------|
| Android Chrome | Fullscreen nativo funciona |
| Android Firefox | Fullscreen nativo funciona |
| iOS Safari | Abre video en Vimeo.com (fallback) |
| iOS Chrome | Abre video en Vimeo.com (fallback) |
| iPad Safari | Puede funcionar fullscreen o usar fallback |
| Desktop (todos) | Fullscreen nativo funciona |

## Mensajes de Consola para Debug

Si abres la consola del navegador, verás estos mensajes:

- `"Fullscreen API no soportada en este dispositivo"` - Normal en iOS
- `"No se pudo usar fullscreen nativo de Vimeo"` - Intentó método de Vimeo
- `"No se pudo activar fullscreen webkit en iOS"` - Intentó método webkit
- `"Abriendo video en Vimeo"` - Usando fallback de iOS

## Solución de Problemas

### El botón no hace nada
1. Verifica la consola para errores
2. Confirma que el video está cargado
3. Prueba refrescar la página

### Se abre Vimeo en lugar de fullscreen (iOS)
Esto es el comportamiento esperado en iOS Safari debido a las restricciones del navegador.

### El video se corta en fullscreen
Hemos configurado el video para mantener su aspect ratio 9:16 (vertical). En landscape, aparecerán barras negras a los lados.

## Código Afectado

- `/src/components/react/VimeoHeroPlayer.jsx` - Componente principal actualizado
- Funciones modificadas:
  - `checkFullscreenSupport()` - Nueva función
  - `getFullscreenElement()` - Nueva función
  - `requestFullscreen()` - Nueva función con prefijos
  - `exitFullscreen()` - Nueva función con prefijos
  - `toggleFullscreen()` - Actualizada con múltiples fallbacks

## Para Desarrolladores

Si necesitas debuggear más a fondo:

1. Conecta el dispositivo móvil a tu computadora
2. Usa las herramientas de desarrollo remoto:
   - Chrome: chrome://inspect
   - Safari: Desarrollador > [Tu dispositivo]
3. Observa los logs de consola mientras pruebas

## Notas Adicionales

- **Orientación libre**: NO se fuerza ninguna orientación al entrar en fullscreen
  - Los videos son verticales (9:16), diseñados para verse en portrait
  - El usuario puede rotar su dispositivo libremente según su preferencia
  - En landscape, el video mantiene su aspect ratio con barras negras a los lados
- Los controles se auto-ocultan después de 3 segundos en fullscreen
- El volumen inicia en mute para permitir autoplay en móviles

## Cambio Reciente (Orientación)

Se removió el bloqueo automático de orientación horizontal porque:
1. Los videos son verticales (formato 9:16 tipo reel/TikTok)
2. Se ven mejor en orientación portrait (vertical)
3. Forzar landscape causaba una mala experiencia de usuario
4. Ahora el usuario tiene control total sobre la orientación