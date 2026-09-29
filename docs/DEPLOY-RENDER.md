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
