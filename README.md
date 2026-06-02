# chulaAll

A personal portal: a collapsible hamburger menu that loads each website into an **iframe**. Pick a site from the menu → it shows in the frame.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173/

## Edit the website list

All links live in **`src/sites.js`**. Copy a line and change `id`, `name`, `url`, `group`. The menu and frame update automatically.

---

## ⚠️ Staying logged in (third-party cookies)

Because sites load inside an iframe, their login cookies are **third-party cookies**. Modern browsers **block these by default**, so logins won't persist (or the site may show blank / "refused to connect") until you allow them.

> chulaAll cannot enable this for you — it's a browser security setting you control. Once allowed, your login persists as long as you also tick **"remember me"** on each site and use the same browser (not incognito).

### Chrome / Edge

1. Open `chrome://settings/cookies` (Edge: `edge://settings/content/cookies`).
2. Under **"Sites that can always use cookies"** → **Add**.
3. Add each site with the **wildcard + leading dot** so subdomains match, and tick **"Including third-party cookies on this site"**:
   - `[*.]chula.ac.th`
   - `[*.]rcuchula.com`
   - `[*.]mycourseville.com`
4. Reload chulaAll and log in inside the frame.

(Alternatively, the toolbar **eye icon** in the address bar lets you allow third-party cookies for the current page.)

### Firefox

1. `about:preferences#privacy` → **Enhanced Tracking Protection**.
2. Either set it to **Standard**, or click **Manage Exceptions** and add `http://localhost:5173`.
3. Reload and log in.

### Safari

1. **Settings → Privacy** → untick **"Prevent cross-site tracking"** (Safari has no per-site allowlist for this).
2. Reload and log in.

---

## If a site still won't embed

Some sites send `X-Frame-Options: DENY` / `Content-Security-Policy: frame-ancestors`, which **forbids** iframing entirely — no browser setting overrides that. For those, use the **"↗ Open"** button in the header to open the site in a normal tab (where logins always work).
