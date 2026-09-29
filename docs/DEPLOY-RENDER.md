# Deploy ne Render — Paneli Admin

Renderi e hoston **panelin admin** (`admin-dashboard/index.html`).
Aplikacioni mobile React Native/Expo NUKU deploy-ohet ne Render — ndërtohet
me APK (`npm run build:apk`) ose publish-ohet në EAS.

## 1. Deploy me Blueprint (render.yaml)

1. Render Dashboard → **New +** → **Blueprint**
2. Lidh repo-në: `https://github.com/1bush/Ustai`
3. Render e lexon automatikisht `render.yaml` në root
4. **Apply** → prisni build-in
5. Përfundon me URL si `https://ustai-admin.onrender.com`

Pas kësaj çdo `git push` në `main` e bën deploy-un automatik.

## 1b. Sync-i i Blueprint-it (Render Dashboard)

Blueprint-i ekzistues (`exs-dau0lm142hec73dd1vpg`) ka faqen e vet të sync-it:

<https://dashboard.render.com/blueprint/exs-dau0lm142hec73dd1vpg/syncs>

Render-i e cache-on versionin e `render.yaml` nga momenti i **Apply**-it të parë. Nëse
faqja ende shfaq një gabim të vjetër (p.sh. `autoDeploy and autoDeployTrigger cannot
both be set`), fajlli në repo është OK por Render-i nuk e ka rilexuar ende:

1. Hap faqen e **Syncs** më sipër dhe kliko **Sync now**.
2. Nëse ende shfaq gabim, krijo Blueprint të ri: Dashboard → **New +** → **Blueprint**
   → lidh `1bush/Ustai` → **Apply**.

Para çdo push-i te `render.yaml`, valido lokalisht:

```bash
npm run validate:render   # python scripts/validate-render-blueprint.py
```

Skripti e kontrollon fajllin kundrejt skemës zyrtare
(`https://render.com/schema/render.yaml.json`) dhe del me kod 1 nëse ka gabime.

## 2. Lidhja me PocketBase

`admin-dashboard/index.html` nuk e ka më URL-në e hardkoduar
(`http://127.0.0.1:8090`). URL-ja merret me këtë prioritet:

| Burimi | Shembull |
|---|---|
| Query param | `https://ustai-admin.onrender.com/?pb=https://db.ustai.al` |
| `localStorage` | linku "Ndrysho serverin" në faqen e login-it |
| `window.USTAI_PB_URL` | p.sh. `http://192.168.1.15:8090` |
| Fallback | `location.hostname + ":8090"` |

Pra: hape panelin, shkruaj URL-në e serverit PocketBase te fusha
**"Ndrysho serverin"** — ruhet në browser dhe punon edhe pas rifreskimit.

> Shenim: që funksionon nga telefoni, PocketBase duhet të jetë i arritshëm
> në rrjetin publik (p.sh. i deploy-uar ndërsa Web Service në Render ose në
> nje VM me port 8090 të hapur). `127.0.0.1` nuk funksionon jashtë kompjuterit.

## 3. Deploy manual (pa Blueprint)

Render Dashboard → **New +** → **Static Site**

- Repository: `1bush/Ustai`
- Branch: `main`
- Build Command: *(lër bosh)*
- Publish Directory: `admin-dashboard`
- Free plan: mos aktivizo "Auto-Deploy" nëse doni vetëm manual deploy
