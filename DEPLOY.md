# Deploying this site

Everything is static: index.html, app.js, data.js, israel_us_report.md, robots.txt, vercel.json.
No build step, no dependencies, no CDN calls. Any of these gets you a public URL.

## 1. Vercel with the CLI (from this folder)
    cd site
    npx vercel login          # opens vercel.com/device, you confirm in your browser
    npx vercel --prod         # first run creates the project; prints https://<name>.vercel.app
Later updates: `npx vercel --prod` again from the same folder (it remembers the project in .vercel/).

Pick the URL name on the first run, e.g. `israel-us-iran-2026` -> https://israel-us-iran-2026.vercel.app

## 2. Vercel with an API token (no browser sign-in; good on a phone or CI)
Create a token at vercel.com > Account > Settings > Tokens (fine-grained, short-lived is fine; revoke it after).
    npx vercel deploy --prod --token=VERCEL_TOKEN_HERE --yes
Or without Node at all:
    curl -X POST https://api.vercel.com/v1/deployments?projectName=israel-us-iran-2026\\
      -H "Authorization: Bearer $VERCEL_TOKEN_HERE" -H "Content-Type: application/json"       -d @deployment.json
where deployment.json is: {"name":"israel-us-iran-2026","project":"israel-us-iran-2026","target":"production","framework":null,
 "files":[{"path":"index.html","data":"<file contents>"},{"path":"app.js","data":"..."},{"path":"data.js","data":"..."}]}
Then poll GET https://vercel.com/api/deployments/vc/deployment/<id> until "ready", and open https://israel-us-iran-2026.vercel.app

## 3. Vercel from a Git repo (no CLI, dashboard only)
Push this folder to a repo (any host), then vercel.com > Add Project > import that repo. Build preset: "Static" (or skip), output: "."
Every push then redeploys, which is handy if you want to keep editing the report.

## 4. Any other static host works the same way
GitHub Pages (push folder to /docs or root, enable Pages), Cloudflare Pages, Netlify, S3, or just a zip you unzip on a web server.
The page has no server side anything: it is one HTML file plus two JS files.

## Local preview without any host
    cd site && python -m http.server 8080      # then open http://localhost:8080
Or simply open index.html by double-clicking it: everything loads from local files (search, filters, popovers all work).
Note: the "Copy link" button uses the clipboard API, which needs http(s); on file:// it falls back to showing the URL.

## What the URL structure gives you
    https://<host>/                -> whole report, all 20 sections, dashboard at the top
    https://<host>/#14-could-there-be-cause-for-a-false-flag-to-get-   -> that one section, shareable
    https://<host>/?print=1        -> print/PDF-friendly mode
Section anchors are slugs of the section titles, so a link from a chat app reopens exactly that part.
