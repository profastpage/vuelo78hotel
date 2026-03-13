# QA Workflow

## Goal

Turn visual and frontend quality from a subjective judgment into a repeatable delivery flow.

## Mandatory Sequence

1. Confirm active client folder.
2. Confirm engine kind:
   - Landing
   - Brand Site
   - Storefront
   - Agency / Personal Brand
3. Confirm visual style and layout mode.
4. Run technical validation:
   - `npm run typecheck`
   - `npm run build` when relevant
5. Run project QA scripts:
   - `npm run qa:project`
   - `npm run qa:content`
6. Run visual capture flow when localhost is available:
   - `npm run qa:visual -- --url http://127.0.0.1:3000`
7. Review mandatory breakpoints:
   - `320`
   - `375`
   - `768`
   - `1440`
8. Review the engine-specific checklist in:
   - `docs/ENGINE_QA_LANDING.md`
   - `docs/ENGINE_QA_BRAND.md`
   - `docs/ENGINE_QA_STOREFRONT.md`
   - `docs/ENGINE_QA_AGENCY.md`
9. Fix visual, content, or responsive defects.
10. Do not close until the page is both correct and polished.

## What QA Must Catch

- overlaps
- horizontal page overflow
- crushed columns
- dead whitespace
- duplicate text from demo assets
- broken CTA hierarchy
- poor mobile fixed UI placement
- inconsistent theme execution
- weak or contradictory copy

## Exit Standard

A client is ready only when all of the following are true:

- technically valid
- responsive
- visually intentional
- content-clean
- engine-consistent
- theme-consistent
- client-ready
