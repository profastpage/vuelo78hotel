## AGENTS.md

### Alcance

- Este archivo define la base para todos los nuevos proyectos creados desde `_TEMPLATE_CODEX_REPO`.
- Todo cliente nuevo debe heredar estas reglas.

### Skills Obligatorias Segun La Tarea

- Usa `$brand-system` para identidad visual, tono, art direction, theming de marca y para elevar la calidad desde el primer prompt.
- Usa `$copy-positioning` para headlines, CTA, promesa, posicionamiento y estructura comercial del mensaje.
- Usa `$landing-page-director` para landing pages, homepages, pricing, launch pages y composicion comercial premium.
- Usa `$dashboard-director` para dashboards, CRMs, paneles de control y superficies densas de datos.
- Usa `$app-shell-architect` para shell de producto, navegacion, workspace layout y estructura global.
- Usa `$design-system-builder` para tokens, componentes base, kits visuales y elevacion de shadcn/Tailwind.
- Usa `$design-critic` para revision visual, jerarquia, polish y segunda pasada de calidad.
- Usa `$conversion-critic` para revisar persuasion, friccion, CTA y conversion en paginas o flujos comerciales.
- Usa `$master-frontend` para interfaz, layout, componentes, theming, animaciones y polish visual.
- Usa `$master-backend` para formularios, endpoints, integraciones, validaciones y seguridad.
- Usa `$master-fullstack` para flujos que toquen UI y backend al mismo tiempo.
- `$master-frontend` y `$master-fullstack` implican UI totalmente responsive como baseline obligatorio: mobile-first, sin overflow horizontal, con `max-width: 100%` donde haga falta, grids responsive, top navbar fija en mobile si existe navegacion superior, sidebar solo en desktop si existe navegacion lateral y cards apiladas verticalmente en mobile.

### Routing Recomendada

- Usa `$brand-system` + `$copy-positioning` antes de implementar cuando el proyecto necesite mejor marca, tono, promesa o CTA.
- Usa `$landing-page-director` antes de `$master-frontend` para paginas comerciales o si `REFERENCE_MODE` esta activo.
- Usa `$design-system-builder` antes o junto a `$master-frontend` cuando falte una base visual reusable.
- Usa `$dashboard-director` y `$app-shell-architect` cuando el cliente tenga modulos, auth, area privada o vistas operativas.
- Usa `$conversion-critic` y `$design-critic` despues de cambios importantes para una pasada de calidad.

### Orden De Lectura Antes De Cambiar Codigo

1. Leer `raw.txt` si existe.
2. Leer `docs/contract.md` si existe.
3. Leer `docs/context.md` si existe.
4. Leer `docs/PROJECT_CONTEXT.md` solo como resumen derivado.
5. En cambios UI, leer `docs/UI_GUARDRAILS.md` y `docs/CARTA_THEMING.md`.
6. Si falta documentacion, usar `README.md` y la estructura real del proyecto.

### Regla Obligatoria De Generacion De Sitios

- Siempre leer `raw.txt` antes de generar, redisenar o ajustar la web de un cliente.
- Si `raw.txt` contiene `REFERENCE_MODE: true` y `REFERENCE_WEBSITE`, usar esa referencia solo para inspiracion de layout y composicion.

No copiar:

- nombres de marca
- logos
- textos
- imagenes
- claims
- activos propietarios

### Estandar Visual

- El resultado debe sentirse premium, moderno y listo para vender.
- No producir una plantilla generica.
- Priorizar claridad, jerarquia visual, mobile-first real y UX profesional.
- Usar placeholders temporales solo cuando falte material del cliente.

### Reglas Tecnicas

- Reutilizar el sistema existente antes de crear variaciones innecesarias.
- Mantener diff minimo y evitar refactors fuera del alcance.
- Validar inputs y no confiar en datos enviados por el cliente.
- Nunca exponer secretos, tokens o stack traces.

### Validacion Obligatoria

- Ejecutar `npm run typecheck` despues de cambios relevantes.
- Ejecutar `npm run qa` si existe antes de cerrar trabajo importante.
- Ejecutar `npm run build` antes de cerrar cambios importantes.
- Ejecutar `npm run lint` si existe.

### Flujo De Trabajo

- Respetar la identidad del cliente y la documentacion del proyecto.
- No hacer commits, push ni deploy salvo que el usuario lo pida explicitamente.
- Si cambian rutas, contratos, arquitectura o env vars, actualizar la documentacion correspondiente.
