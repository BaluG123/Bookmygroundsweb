# BookMyGrounds Website

Static website built against the live BookMyGrounds API.

## Files

- `index.html` — page structure
- `styles.css` — visual system and responsive layout
- `app.js` — API integration, auth, favorites, slots, bookings

## Run locally

Use any static server from the `website` folder. Example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Live API

The site currently points to:

`https://bookmyground.pythonanywhere.com/api/v1`

## Deploy

This folder can be deployed as static hosting on:

- Netlify
- Vercel static output
- Cloudflare Pages
- PythonAnywhere static files

Point your domain `bookmygrounds.in` to the host you choose, then publish the contents of this folder.
