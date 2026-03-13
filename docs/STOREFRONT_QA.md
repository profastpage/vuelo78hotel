# Storefront QA

## Objetivo

Evitar que el motor `Storefront` rompa layout, produzca scroll horizontal de pagina completa o aplaste contenido entre desktop y mobile.

## Breakpoints Obligatorios

- `320px`
- `375px`
- `768px`
- `1440px`

## Reglas Base

- El scroll horizontal solo puede vivir dentro de rails como colecciones, testimonios o productos cuando aplique.
- La pagina completa nunca debe moverse lateralmente.
- Ninguna card, imagen, CTA o columna puede invadir otra seccion.
- Ningun texto principal puede salir del viewport ni quedar cortado.
- Hero, productos, FAQ y testimonios deben conservar lectura clara.
- El menu mobile debe abrir y cerrar sin empujar el layout.

## Checklist por Zona

### Hero storefront

- El titular no debe desbordar el ancho visible.
- La imagen principal no debe empujar el layout fuera del viewport.
- La columna lateral de categorias debe apilarse correctamente en mobile.
- Los CTAs deben mantenerse visibles y clickeables.

### Topline y headbar

- Branding, buscador y links no deben solaparse.
- En mobile, el buscador y links deben caer en columnas limpias.
- Ningun chip o link debe salir del ancho visible.

### Colecciones y rails

- El rail puede deslizar dentro de su propio contenedor.
- El rail no debe generar `overflow-x` en `body`, `html` o `.page-shell`.
- Las cards deben mantener ancho consistente sin aplastar copy o imagen.

### Grid de productos

- En desktop debe verse ordenado y sin alturas rotas.
- En tablet y mobile debe refluír a una sola columna o rail sin romper botones.
- El boton `Ver producto` no puede salirse de la card ni quedar cortado.

### Testimonios y acompanamiento

- Las cards no deben montarse sobre FAQ o columna utilitaria.
- Si hay rail horizontal, debe quedar contenido y usable con touch.
- Los avatars o imagenes no deben deformar el ancho de la card.

### FAQ y columna utilitaria

- Nunca debe aplastar la columna principal.
- En mobile debe bajar debajo del contenido principal, no al costado.
- Chips de modulos deben wrappear sin empujar el viewport.

### Floating UI

- `Editor local`, menu mobile, drawer, CTA flotante o botones fijos no deben tapar contenido esencial.
- Ningun elemento fixed debe causar ancho extra.

## Cierre Obligatorio

- Confirmar `sin x-scroll` en `320`, `375`, `768` y `1440`.
- Confirmar `sin overlaps` entre hero, cards, rails, FAQ y botones.
- Confirmar que solo los rails internos hacen scroll lateral.
- Confirmar legibilidad real en mobile antes de cerrar.
