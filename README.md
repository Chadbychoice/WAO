# WAO – We Are Open

Bilingual, responsive project website for the planned **WAO 24/7 Smart Service Hub** at Hansering 7 in Lemwerder.

## Included

- German and English pages (`/de/`, `/en/`)
- Responsive desktop/mobile navigation
- WAO brand system and optimised WebP/JPEG images
- Investor and customer-facing content
- Downloadable three-page investor exposé
- Accessible image gallery with lightbox
- Project status, FAQ and contact area
- Optional Vercel serverless contact form
- No analytics, trackers or third-party frontend dependencies

## Deploy to Vercel

Import the repository in Vercel. The project is a static website with one optional function in `/api/contact.js`; no build command is required.

### Contact form environment variables

Set these in **Vercel → Project Settings → Environment Variables**:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL` — a sender on a verified domain

Without these variables the website still works, but the contact form displays a configuration message instead of sending email.

## Local preview

```bash
npm run dev
```

Open `http://localhost:3000/de/` or `http://localhost:3000/en/`.

## Before public launch

Complete the operator details in:

- `de/impressum.html`
- `de/datenschutz.html`
- `en/legal.html`
- `en/privacy.html`

Replace or confirm all project claims, contact data and final opening information before public release.
