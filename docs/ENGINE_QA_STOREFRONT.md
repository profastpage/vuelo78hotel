# Storefront Engine QA

## Core Objective

Storefront pages must feel browseable, product-first, dense enough to sell, and stable under real mobile and desktop usage.

## Required Checks

- hero copy and hero media never overlap
- category/support columns collapse cleanly on smaller screens
- collection rails are internally scrollable or stack safely
- product cards keep aligned CTA buttons
- testimonials and FAQ never invade each other
- floating UI never covers essential content
- no full-page horizontal scroll
- mobile browsing still feels commercial, not broken

## Required Breakpoints

- `320`
- `375`
- `768`
- `1440`

## Failure Examples

- crushed product cards
- duplicate text from image assets
- testimonial cards overlapping
- CTA buttons cut off
- search/header actions overflowing viewport
