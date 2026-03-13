# UI Guardrails

## Objetivo

Mantener una interfaz profesional, estable y usable en mobile y desktop sin introducir regresiones visuales evitables.

## Reglas Obligatorias

- Sin `overflow-x` en `320px`, `375px`, `768px` y `1440px`.
- Sin overlaps entre header, hero, cards, formularios, drawers, modals y footers.
- Sin texto cortado ni botones fuera del viewport.
- Focus visible, contraste suficiente y labels correctos en formularios.
- Respetar `prefers-reduced-motion` si hay animaciones.
- No tocar UI no relacionada con la tarea.
- La creatividad visual nunca debe romper jerarquia, conversion o legibilidad.
- Si se usan grids asimetricos, radios grandes, blur o serif display, deben estar contenidos por `minmax`, `clamp`, y colapso limpio en mobile.
- No usar desplazamientos decorativos, offsets o mosaicos si generan aplastamiento, solapes o lectura confusa.
- `border-radius: 50px` es un tope visual para shells grandes, no una regla global para todo el sistema.
- `backdrop-filter: blur(15px)` debe sentirse sutil y nunca comprometer contraste de texto, formularios o CTA.

## Estados Minimos

- `default`
- `hover`
- `focus`
- `loading`
- `empty`
- `error`

## Checklist de Cierre

- Layout estable en mobile y desktop.
- Sin scroll horizontal.
- Sin flashes o saltos visuales graves.
- CTA principal visible y usable.
- Formularios navegables con teclado cuando existan.
- Si hay direccion visual organica o editorial, confirmar que la composicion sigue siendo facil de escanear en menos de 3 segundos.
- Confirmar que titulos serif no rompen columnas, no invaden media y no fuerzan alturas absurdas en mobile.

## Storefront

- Para cualquier cambio en el motor `Storefront`, revisar tambien `docs/STOREFRONT_QA.md`.
- En e-commerce, el rail horizontal debe estar encapsulado; `body`, `html` y `.page-shell` no deben moverse lateralmente.
- Hero, categoria lateral, grid de producto, testimonios y FAQ deben verificarse obligatoriamente en `320px`, `375px`, `768px` y `1440px`.
