# Contrato Tecnico

## Estado del Contrato

- Version actual: `v1`
- Responsable: `Pendiente de asignar`
- Ultima revision: `2026-03-10`
- Estado: `base inicial editable`
- Tipo de proyecto: `Sin preset`
- Rubro: `Sin preset`

## Convenciones Globales

- Auth requerida: `no por defecto`
- Formato de respuesta exitosa: `{ ok: boolean, ...payload }`
- Formato de error: `{ ok: false, message: string, code?: string }`
- Headers relevantes:
- Content-Type: application/json
- Regla de versionado: `mantener compatibilidad hacia atras salvo aprobacion explicita`

## Modulos considerados

- Sin modulos activos

## Modelos Compartidos

### Base

- `Lead`
  - `id: string`
  - `name: string`
  - `email: string`
  - `message?: string`

## Endpoints
### GET /api/health

- Objetivo: healthcheck basico.
- Request:
  - body: `none`
  - query: `none`
- Response 200:
  - `ok: true`
  - `service: string`

### POST /api/contact

- Objetivo: capturar leads o mensajes iniciales.
- Request:
  - body:
    - `name: string`
    - `email: string`
    - `message: string`
- Response 200:
  - `ok: true`
  - `message: string`
- Errores:
  - `400` si faltan datos requeridos

## Reglas de Cambio

- No romper rutas publicas ni shape principal de respuestas sin versionado.
- Si un cambio es breaking, documentar `v2` manteniendo `v1` mientras siga en uso.
- Todo cambio aprobado del contrato debe actualizar este archivo en el mismo commit.

## Changelog del Contrato

- 2026-03-10 | Contrato regenerado segun configuracion actual | docs | Ajustar payloads reales antes de producir.