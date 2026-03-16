# Template System

## Objetivo

Convertir la web en una base reusable para FastPagePro donde el contenido y el negocio se controlen desde un JSON central sin tocar los componentes.

## Archivo principal

- `site.json`: configuracion activa del sitio.

## Selector de configuracion

- El loader usa `site.json` por defecto.
- Si defines `SITE_CONFIG_PATH`, el proyecto carga otro JSON relativo o absoluto.
- Ejemplo:
  - `SITE_CONFIG_PATH=templates/restaurant/site.json`
  - `SITE_CONFIG_PATH=templates/store/site.json`

## Estructura de plantillas

- `templates/hotel/site.json`
- `templates/restaurant/site.json`
- `templates/store/site.json`
- `templates/services/site.json`

## Componentes reutilizables

- `src/components/templates/TemplateHero.tsx`
- `src/components/templates/TemplateFeatures.tsx`
- `src/components/templates/TemplateGallery.tsx`
- `src/components/templates/TemplateServices.tsx`
- `src/components/templates/TemplateTestimonials.tsx`
- `src/components/templates/TemplateContact.tsx`

## Loader y tipos

- `src/lib/template-site-config.ts`
- `src/types/template-site.ts`

## Notas

- La home ahora se renderiza desde `site.json`.
- Los subpaths legacy del proyecto hotel siguen existiendo aparte del nuevo sistema de plantillas.
- Para crear otra web, cambia `site.json` o apunta `SITE_CONFIG_PATH` a otro JSON.
