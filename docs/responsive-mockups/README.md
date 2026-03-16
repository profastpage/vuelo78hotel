# Responsive Mockups

Esta carpeta almacena las capturas que documentan cómo se comporta el layout en `https://vuelo78hotel.vercel.app/` para desktop y mobile. Usamos fotografías reales (sin edición de diseño) y las acompañamos de notas técnicas para veer las diferencias por sección.

## Guía rápida

- `hero-desktop.png` (1440px+): muestra el hero premium con el slider, los llamados a la acción lado a lado y el booking widget integrado dentro del contenido. El botón primario se expande, el card de reservas queda inline y la banda de beneficios se muestra horizontal.
- `hero-mobile.png` (375px): el hero pasa a stacking vertical, las CTA quedan una sobre otra, el booking card se separa con margin y los beneficios se apilan. Es el mejor archivo para verificar comportamiento en phone.
- `booking-desktop.png` → destaca el módulo de reservas dentro del héroe, con campos inline (habitación, check-in, check-out...) y el botón de reserva ancho. Úsalo para revisar el spacing y el enfoque en desktop.
- `booking-mobile.png` → la misma barra refluye a una columna compacta; los selectores se apilan y el botón se vuelve bloque para facilitar tap.
- `landing-desktop.png` → captura la landing completa a 1440px para entender la estructura general (hero, módulos de experiencia, testimonios, CTA). Sirve como referencia de composición global.
- `landing-mobile.png` → versión mobile del layout entero, útil para validar que la jerarquía y los flujos mantienen proporciones y legibilidad en 375px.

## Recomendación de uso

1. **Por sección**: usa `hero-*` y `booking-*` para mostrar cambios puntuales (CTA, widget, benefits). Las anotaciones se usan para guiar a diseño/front-end cuando se trabaja sobre botones, tarjetas y formularios específicos.
2. **Landing completa**: conserva `landing-*` como respaldo para contextuar la narrativa y asegurarte de que el conjunto mantiene una versión cohesiva. No necesitas una sola imagen gigante si ya tienes las secciones clave; pero sí vale la pena tenerla para QA de composición.

## Cómo reproducir (interno)

1. Ejecuta `node scripts/capture-responsive.js` y asegúrate de tener `playwright` instalado y los navegadores descargados (`npx playwright install chromium`).
2. Las capturas se guardan automáticamente en esta carpeta; reemplázalas si actualizas el hero o el booking para reflejar los nuevos estados.
3. Usa el README y cada archivo PNG dentro del kit para construir las anotaciones en Figma/Photoshop y explicar la transición Desktop → Mobile en presentaciones o briefs.
