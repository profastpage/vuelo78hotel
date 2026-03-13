# CLIENTE 4 - Vuelo 78 Hotel Tarapoto

## Resumen

- Cliente: `Vuelo 78 Hotel Tarapoto`
- Negocio: `Vuelo 78 Hotel Tarapoto`
- Tipo de proyecto: `Sin preset`
- Rubro: `Sin preset`
- Tema: `Dark`
- Estilo visual: `Moderno`
- Layout mode: `Soft`
- Shell mode: `Framed`
- Concepto visual: `Sistema visual adaptable`
- Mood compositivo: `Composicion dinamica, limpia y contemporanea`
- Firma visual: `signature-drift`
- Referencia: `https://www.estelarmiraflores.com/es/habitaciones/suite-estelar/?_gl=1*1w04abv*_up*MQ..*_ga*MTQzODc0NTkxNS4xNzczMTAxNjA4*_ga_57DL365T2M*czE3NzMxMDE2MDckbzEkZzAkdDE3NzMxMDE2MDckajYwJGwwJGgxNTU1ODIxNjE5`

## Perfil rapido

- Descripcion: `Negocio listo para personalizar con narrativa, beneficios y assets reales del cliente.`
- Oferta principal: `Construir una presencia digital profesional adaptable a la meta comercial del cliente.`
- Objetivo: `Definir el objetivo principal del sitio y optimizar la experiencia alrededor de ese objetivo.`
- Especialidad / foco: ``
- Estilo de copy: `Manual`
- Concepto visual: `Sistema visual adaptable`
- Mood compositivo: `Composicion dinamica, limpia y contemporanea`
- Firma visual: `signature-drift`
- WhatsApp: `51999999999`
- Email: `hola@negocio.com`

## Documentos base

- `AGENTS.md`: reglas del agente para este repo.
- `docs/context.md`: memoria viva del proyecto.
- `docs/contract.md`: contrato tecnico.
- `docs/site-blueprint.md`: blueprint funcional y de negocio.
- `docs/feature-checklist.md`: checklist de capacidades.
- `docs/visual-direction.md`: direccion visual y referencias.
- `docs/content-architecture.md`: estructura de paginas y bloques.
- `docs/launch-checklist.md`: checklist operativo para salida.
- `docs/kickoff-prompt.md`: prompt base para arrancar implementacion.
- `docs/customization-workflow.md`: flujo obligatorio para personalizar el cliente sin desalinear docs ni localhost.
- `config/client-profile.json`: perfil del cliente y modulos.
- `config/site-content.json`: contenido demo conectado al frontend local.
- `.cursorrules`: reglas base para Cursor Agent dentro del proyecto.
- `content/raw.txt`: entrada libre del negocio para el flujo AI.
- `content/brief.yaml`: brief estructurado conectado al frontend actual.
- `ai/prompt-web-generator.md`: prompt base del AI website generator.
- `docs/UI_GUARDRAILS.md`: reglas de interfaz.
- `Abrir Stack Trabajo.cmd`: abre el proyecto en Cursor + VS Code + localhost.
- `Modo Produccion.cmd`: abre el proyecto en Cursor + VS Code + localhost + watcher AI + revision rapida.
- `Aplicar Widget Negocio.cmd`: aplica el widget reutilizable por rubro.
- `Ver Local.cmd`: arranque local rapido del proyecto.
- `Revisar Cliente.cmd`: ejecuta QA, build y revision visual opcional.
- `Personalizar Cliente.cmd`: editor rapido para cambiar rubro, tipo y modulos.
- `run-ai.cmd`: inicia el watcher AI para regenerar el brief desde `content/raw.txt`.

## Modulos activados

- Sin modulos activados por preset

## Flujo AI Website Generator

1. Pegar la informacion del negocio en `content/raw.txt`.
2. Ejecutar `run-ai.cmd` para iniciar el watcher.
3. Guardar `content/raw.txt` para regenerar `content/brief.yaml` sin tocar la arquitectura actual.
4. El watcher corre `npm run generate:website` y luego refina con Cursor Agent leyendo `AGENTS.md`, `.cursorrules`, `ai/prompt-web-generator.md`, `content/raw.txt` y `content/brief.yaml`.
5. Revisar `content/brief.yaml` y luego abrir localhost con `Ver Local.cmd`.
6. Si `REFERENCE_MODE` esta en `true`, el generador debe inspirarse en la estructura de la web indicada sin copiar branding, textos ni imagenes reales.

## Flujo dual recomendado

1. Ejecutar `Abrir Stack Trabajo.cmd` para abrir Cursor + VS Code + localhost.
2. Usa Cursor para generacion, prompts y cambios grandes.
3. Usa VS Code para terminal, diff y control fino del codigo.
4. Valida todo en localhost antes de pasar a QA.
5. Usa `Modo Produccion.cmd` cuando quieras sumar watcher AI y revision rapida desde el inicio.

## Siguiente paso

1. Ejecutar `Personalizar Cliente.cmd` cuando cambien rubro, tipo o modulos.
2. Ejecutar `Revisar Cliente.cmd` despues de cambios importantes.
3. Revisar `docs/customization-workflow.md`.
4. Completar `docs/context.md`.
5. Confirmar alcance en `docs/site-blueprint.md`.
6. Ajustar el contrato en `docs/contract.md`.
7. Ejecutar el desarrollo con frontend/backend segun el caso.
