# Customization Workflow

## Regla Principal

Antes de desarrollar un cliente de forma seria, personaliza primero el proyecto con `Personalizar Cliente.cmd`.

## Cuando Es Obligatorio

- Cambio de rubro de negocio.
- Cambio de tipo de proyecto.
- Activacion o desactivacion de modulos como WhatsApp, formulario, reservas, blog, auth, carrito, pagos o multi-tenant.
- Cambio de nombre del cliente o del negocio.
- Cambio de descripcion, oferta principal, objetivo, WhatsApp o email.
- Cambio de tema, estilo visual o colores principales.

## Flujo Correcto

1. Ejecutar `Personalizar Cliente.cmd`.
2. Guardar la nueva configuracion.
3. Verificar que se hayan actualizado:
   - `config/client-profile.json`
   - `config/site-content.json`
   - `docs/context.md`
   - `docs/contract.md`
   - `docs/site-blueprint.md`
   - `docs/feature-checklist.md`
   - `docs/visual-direction.md`
   - `docs/content-architecture.md`
   - `docs/launch-checklist.md`
   - `docs/kickoff-prompt.md`
   - `README.md`
4. Abrir `Ver Local.cmd` o refrescar el localhost si ya estaba corriendo.
5. Confirmar que hero, CTA, FAQs, secciones y contenido base reflejen el nuevo rubro/tipo.
6. Confirmar que tema, colores, estilo visual y textos del negocio se reflejen en localhost.

## Lo Que No Debe Hacerse

- No editar manualmente `config/client-profile.json` o `config/site-content.json` si el cambio puede hacerse por la GUI.
- No seguir desarrollando una app con un rubro o tipo desactualizado.
- No mezclar contenido real del cliente con presets viejos sin regenerar antes la base.

## Criterio de Salida

La personalizacion esta correcta cuando:

- el `README.md` describe el cliente actual,
- `docs/context.md` y `docs/contract.md` coinciden con el alcance actual,
- `config/client-profile.json` representa el estado real del proyecto,
- el localhost muestra cambios reales acordes al rubro y tipo configurados.
