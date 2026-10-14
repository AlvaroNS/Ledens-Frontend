# Ledens — Architecture & Development Guide

<!-- verified: dev environment + push access confirmed 2026-08-20 -->

## Project Overview
Ledens is a lead-capture landing page for a home-renovation company (Sociedad Inversora Navarro Robinson S.L., Málaga).
It is a separated frontend/backend deployment on Azure:

- **Frontend** → Azure Static Web Apps (SWA)
- **Backend** → Azure Container Apps (ACA)
- **Database** → Azure Files share mounted at `/data` (leads stored as `leads.jsonl`)

---

## Repository Layout

```
ledens/
  frontend/          React 18 + Vite SPA (deployed to SWA)
  backend/           Express 4 API server (deployed to ACA via Docker)
  infra/
    setup.sh         Full provisioning script (run once per new subscription)
    setup2.sh        Targeted recovery script (fix partially-provisioned env)
  docker-compose.yml Local full-stack dev with Docker
  .env.example       Root-level env var reference
.github/
  workflows/
    azure-static-web-apps.yml   Frontend CI/CD → SWA
    deploy-backend.yml          Backend CI/CD → ACA via ACR
```

---

## Architecture

```
Browser
  │
  └─► Azure Static Web Apps (webapp-ledens-landing-1)
        • Hostname: wonderful-mushroom-01c0aee03.7.azurestaticapps.net
        • Serves the Vite build (ledens/frontend/dist)
        • /api/* requests → proxied automatically to Container App
        │                   (SWA Linked Backend — no CORS headers needed in frontend)
        │
        └─► Azure Container App (ledens-backend)
              • FQDN: ledens-backend.agreeablebeach-f99c1b78.westeurope.azurecontainerapps.io
              • Express server on port 4000
              • Image pulled from ACR via user-assigned managed identity (no passwords)
              │
              └─► Azure Files share (ledens-data) mounted at /data
                    • Persists leads.jsonl across container restarts / revisions
```

> The `/api/*` proxy is configured at the Azure level via `az staticwebapp backends link`.
> No frontend code change is needed to route API calls — they use relative paths (`/api/...`).

---

## Azure Resources

| Resource | Name | Notes |
|---|---|---|
| Resource Group | `rg-ledens-mvp` | Region: westeurope |
| Static Web App | `webapp-ledens-landing-1` | Frontend host + `/api/*` proxy |
| Container App | `ledens-backend` | Express API, min 1 replica |
| Container Apps Env | `ledens-env` | Linked to Log Analytics workspace |
| Container Registry | `cregledensmvp1` | Login server: `cregledensmvp1-f0b3hcbabag9d3dp.azurecr.io` |
| Managed Identity | `id-ledens-api-acr-pull` | Has AcrPull on the registry; attached to Container App |
| Storage Account | `stledensmvp1` | Azure Files share `ledens-data` → mounted at `/data` |
| Log Analytics | `workspace-rgledensmvpxLsR` | Linked to `ledens-env` |
| Key Vault | `kv-ledens-mvp-1` | Available for secrets (not yet actively used) |
| PostgreSQL Flexible Server | **planned — not provisioned yet** | PostgreSQL 16, Burstable `Standard_B1ms`, `westeurope`. Users/auth data (issue #9). Local dev DB already exists in `docker-compose.yml`. |
| Subscription ID | `550f2d00-7d8d-4699-8b84-6eccff979f88` | MCAPS-Support-alvaron |

---

## Backend (ledens/backend)

**Stack:** Node 20, Express 4, ESM modules
**Port:** 4000 (set via `PORT` env var)
**Image:** `cregledensmvp1-f0b3hcbabag9d3dp.azurecr.io/ledens-backend:latest`

### API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check — returns `{ status: "ok" }` |
| POST | `/api/contact` | Lead capture — appends to `/data/leads.jsonl` |
| POST | `/api/auth/register` | Create an account (name, email, password). Logs in and sets the session cookie. |
| POST | `/api/auth/login` | Email + password login. Sets the session cookie. Rate-limited (10 / 15 min per IP). |
| POST | `/api/auth/logout` | Deletes the current session and clears the cookie. |
| GET | `/api/auth/me` | Returns the logged-in user from the session cookie, or 401. |
| GET | `/api/auth/google` | Starts Google login — redirects to Google, sets a short-lived `oauth_state` cookie. |
| GET | `/api/auth/google/callback` | Google's redirect target. Finds, creates or reclaims the user, sets the session cookie, redirects to `/`. Any failure redirects to `/auth?error=...` instead of showing a raw error. |
| GET | `/api/auth/microsoft` | Starts Microsoft login (personal + work/school accounts). Same shape as `/google`. |
| GET | `/api/auth/microsoft/callback` | Same shape as `/google/callback`. |

All `/api/auth/*` routes return `503` if `DATABASE_URL` isn't set (production, until the DB is provisioned). The OAuth routes also return `503` until their own `*_CLIENT_ID`/`*_CLIENT_SECRET`/`*_REDIRECT_URI` are set (no app is registered with either provider yet — see the build log's open questions for who should own them).

### Contact endpoint payload
```json
{ "name": "string (required)", "phone": "string (required)", "email": "string (optional)", "message": "string (optional, max 2000)" }
```

### Environment variables (production)
| Variable | Value | Source |
|---|---|---|
| `NODE_ENV` | `production` | Set in ACA |
| `PORT` | `4000` | Set in ACA |
| `CORS_ORIGIN` | `https://wonderful-mushroom-01c0aee03.7.azurestaticapps.net` | Set in ACA (SWA hostname) |
| `DATA_DIR` | `/data` | Set in ACA |
| `DATABASE_URL` | PostgreSQL connection string | **Not set in production yet.** Will come from Key Vault once the DB is provisioned. Unset ⇒ database features are off and the API behaves as before. |
| `DATABASE_SSL` | `true` | Set in ACA together with `DATABASE_URL` (Azure PostgreSQL requires TLS) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from Google Cloud Console | **Not set yet** — no app registered. Google login returns 503 until this exists. |
| `GOOGLE_REDIRECT_URI` | e.g. `https://ledens.es/api/auth/google/callback` | Must exactly match a redirect URI registered in the Google Cloud Console. |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | from an Entra app registration | **Not set yet** — no app registered. Microsoft login returns 503 until this exists. |
| `MICROSOFT_REDIRECT_URI` | e.g. `https://ledens.es/api/auth/microsoft/callback` | Must exactly match a redirect URI registered in the Entra app. |

### Database (PostgreSQL)

**Decision:** PostgreSQL over Cosmos DB — the data is relational/tabular (users with unique emails, and later the budget agent's catalogue and past budgets), and Postgres gives unique constraints and transactions that `leads.jsonl` cannot.

**Status:** code and local dev are done; the Azure server is **not provisioned yet**. Leads still go to `leads.jsonl` (the lead flow is deliberately separate from users).

- Driver: `pg`. Connection pool in `src/db/pool.js`, only created when `DATABASE_URL` is set.
- Migrations: numbered `.sql` files in `src/db/migrations/`, applied in order at backend startup (guarded by a Postgres advisory lock so several replicas don't race) and via `npm run migrate`. Applied files are recorded in `schema_migrations`. **Never edit a shipped migration — add a new numbered file.** If migrations fail at startup the error is logged and the API keeps serving (so the lead form never goes down because of the DB).
- Schema (`001_users_and_identities.sql`):
  - `users` — `id` (uuid), `email` (unique, case-insensitive), `name`, `password_hash` (NULL for social-only users), timestamps.
  - `auth_identities` — links a user to Google / Microsoft / Apple (`provider`, `provider_user_id`, unique together). One user can have several, so one person never ends up as two accounts.
- `003_users_email_verified.sql` adds `users.email_verified` (default `false`). See the account-linking security note under "Google login" — this column exists specifically to stop a password registration being used to pre-hijack an account someone later proves ownership of via social login.
- Tests: `cd ledens/backend && npm test` (needs the local DB; skipped if `DATABASE_URL` is unset).

### Authentication (email/password, issue #10)

Sessions, not JWT: a `sessions` row per login (`002_sessions.sql`), the cookie only holds a random token. This makes "log this session out" a one-row delete, which OAuth login (#11–13) and later admin controls will also rely on.

- `src/auth/passwords.js` — hashes with Node's built-in `crypto.scrypt` (no native module to compile in the Alpine Docker image, unlike `bcrypt`).
- `src/auth/sessions.js` — creates/reads/destroys sessions; only a SHA-256 hash of the token is stored in the DB, not the token itself. Also exports `requireAuth`, the middleware any future protected route (e.g. the CEO budget screen) should use.
- `src/routes/auth.js` — the four routes above. Login and registration return the same generic error either way, so the API can't be used to check which emails are registered.
- Session cookie: `ledens_session`, `httpOnly`, `sameSite=lax`, 30 days, `secure` follows `req.secure` (works in both plain-HTTP local dev and HTTPS production without an env var, because `trust proxy` is set).
- `src/app.js` builds the Express app (routes, middleware) without starting it; `src/index.js` runs migrations then calls `app.listen`. This split lets tests start the real app on a random port instead of importing a file that auto-binds `:4000`.

### Google &amp; Microsoft login (issues #11–12)

- `src/auth/providers/google.js` / `microsoft.js` — all the provider-specific HTTP calls (build the authorize URL, trade the code for a token, fetch the profile). Each provider's endpoint URLs are overridable via env vars (`GOOGLE_AUTH_URL`/`GOOGLE_TOKEN_URL`/`GOOGLE_USERINFO_URL`, same pattern for `MICROSOFT_*`) so tests can point them at a local stand-in instead of the real provider — see `test/oauth-google.test.js` and `test/oauth-microsoft.test.js`. Read per-call, not cached at module load — a cached value silently ignores a test's override.
- **No JWT signature verification written by hand.** Instead of validating a provider's `id_token` ourselves (easy to get subtly wrong), we call its own userinfo endpoint with the access token — that call is itself authenticated by HTTPS. Microsoft's userinfo response may not reliably include `email_verified` the way Google's does (unconfirmed against a real account) — both providers are read the same way regardless, and anything other than an explicit `true` counts as unverified, which is the safe default either way.
- Microsoft uses the `common` tenant endpoint, accepting both personal and work/school accounts, per #12's scope.
- `src/auth/identities.js` — `findOrCreateUserFromIdentity(...)`, shared by every provider, reusing `auth_identities` from #9.
  - **Security fix (found and closed while building #12, before Microsoft could inherit it):** the first version linked a new *verified* social login to any existing account with a matching email. Since #10's password registration never proves anyone owns the email they typed in, an attacker could pre-register someone else's email with a password; the real owner's first Google/Microsoft login would then have silently handed their account to that attacker's password. Fixed via `users.email_verified` (`003_users_email_verified.sql`): only an account that has *itself* reached `email_verified = true` (via a prior social login) is a safe link target. A verified login landing on an unverified account instead **reclaims** it — marks it verified, clears the unproven password, and deletes any session already open under it — rather than creating a second account, since `users.email` is unique and a duplicate isn't possible anyway. See `test/oauth-google.test.js`'s reclaim test for the exact scenario this closes.
- `src/routes/oauth.js` — both providers' routes, mounted at `/api/auth` alongside `routes/auth.js` (Express allows two routers at the same prefix). CSRF protection via a one-time `oauth_state` cookie (shared across providers — only one OAuth attempt is ever in flight per browser), checked on the callback before anything else runs.
- Session creation reuses `createSession`/`sessionCookieOptions` from `src/auth/sessions.js` — any login method ends in exactly the same kind of session.

### Adding a new backend route
1. Create `ledens/backend/src/routes/myroute.js` (export a Router)
2. Mount it in `ledens/backend/src/app.js`: `app.use('/api/myroute', myrouteRouter)`
3. Push to `main` — CI rebuilds the image and rolls a new ACA revision automatically

---

## Frontend (ledens/frontend)

**Stack:** React 18, Vite 5, react-router-dom v6
**Build output:** `dist/` (built by the SWA action at deploy time — do not commit `dist/`)
**SPA fallback:** all unknown routes → `index.html` (configured in `staticwebapp.config.json`)

### Routes

| Path | Component | Notes |
|---|---|---|
| `/` | `LandingPage` | Full landing (Hero, Proceso, Galeria, etc.) |
| `/auth` | `AuthPage` | Email/password + Google/Microsoft login, built and owned by this project (issue #14) — no third-party auth SDK |
| `/servicios/:slug` | `ServicioPage` | Individual service detail page |
| `/privacidad` | `PrivacidadPage` | Privacy policy |
| `/terminos` | `TerminosPage` | Terms of service |
| `/cookies` | `CookiesPage` | Cookie policy |
| `*` | `LandingPage` | Fallback |

### Global components
- `Header` — rendered on every route; shows login/register links or the logged-in user + logout, via `useAuth()`
- `CookieConsent` — cookie consent modal, mounted once in `App.jsx` outside `<Routes>`
  - Public API: `window.LedensCookies = { open, close, get, reset }`
  - Saves preferences to `localStorage` key `ledens.cookieConsent.v1`
- `LeadModal` — contact form, opens on CTA clicks, posts to `/api/contact`

### Frontend auth (issue #14)

Clerk is gone — `/auth` and `Header` now talk directly to the backend's `/api/auth/*` routes (see "Authentication" and "Google & Microsoft login" under Backend). No frontend environment variable is needed for auth at all; the backend's own `GOOGLE_*`/`MICROSOFT_*`/`DATABASE_*` variables decide what works.

- `src/context/AuthContext.jsx` — `AuthProvider` (wraps the app in `main.jsx`) and `useAuth()`. Calls `/api/auth/me` once on load; exposes `{ user, loading, refresh, logout }`. The httpOnly session cookie is the real source of truth — this context is just a convenient read of it.
- `src/components/AuthPage.jsx` — one component, not two (Clerk's version split into a Clerk-enabled and a Clerk-disabled variant; the backend's own graceful degrade — e.g. 503 with a DB not yet configured — makes that split unnecessary now). Google/Microsoft are plain `<a href="/api/auth/google">` links, not JS handlers — the backend does the entire redirect and token exchange itself. Apple is shown but `disabled` (issue #13 isn't built yet). Reads `?error=google_failed` etc. from the URL (what the backend's OAuth callback redirects to on failure) and shows it as a normal alert.
- **`/sso-callback` is gone, not replaced.** Clerk needed a client-side page to finish a login in the browser; this project's OAuth exchange happens entirely on the backend (`routes/oauth.js`), so the browser just lands on `/` already logged in. `App.jsx` no longer special-cases any route around `Header`.
- Known rough edge: clicking "Continuar con Google/Microsoft" before `GOOGLE_*`/`MICROSOFT_*` exist shows the backend's raw JSON `503` response, not a styled page — acceptable pre-launch, worth revisiting once those credentials exist.

### Adding a new frontend page
1. Create `ledens/frontend/src/components/MyPage.jsx`
2. Add route in `ledens/frontend/src/App.jsx`
3. Push to `main` on any change under `ledens/frontend/**` — SWA CI rebuilds and deploys automatically

---

## CI/CD

### Frontend — `.github/workflows/azure-static-web-apps.yml`
- **Triggers:** push to `main` touching `ledens/frontend/**` or the workflow file; PR open/sync/close
- **Action:** `Azure/static-web-apps-deploy@v1`
  - `app_location`: `ledens/frontend`
  - `output_location`: `dist`
- **Secret required:** `AZURE_STATIC_WEB_APPS_API_TOKEN`

### Backend — `.github/workflows/deploy-backend.yml`
- **Triggers:** push to `main` touching `ledens/backend/**` or the workflow file; `workflow_dispatch`
- **Steps:**
  1. Azure login (service principal)
  2. `az acr login --name cregledensmvp1-f0b3hcbabag9d3dp.azurecr.io` (full URL bypasses name validator)
  3. `docker build` + push with `${{ github.sha }}` tag and `latest` tag
  4. `az containerapp update --image <sha-tagged-image>` → new ACA revision
  5. Health-check loop (10 attempts, 6 s apart) against `/api/health`
- **Secret required:** `AZURE_CREDENTIALS` (service principal JSON from `az ad sp create-for-rbac --sdk-auth`)

### Required GitHub Secrets
| Secret | Used by | How to obtain |
|---|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | SWA workflow | Azure Portal → Static Web Apps → webapp-ledens-landing-1 → Manage deployment token |
| `AZURE_CREDENTIALS` | Backend workflow | Run `az ad sp create-for-rbac --name sp-ledens-github --role Contributor --scopes /subscriptions/550f2d00-7d8d-4699-8b84-6eccff979f88/resourceGroups/rg-ledens-mvp --sdk-auth` |

---

## Local Development

### Prerequisites
- Node 20+
- Docker + Docker Compose

### Option A — Vite dev server (frontend only)
```bash
cd ledens/frontend
npm install
npm run dev                        # http://localhost:5173
```
Vite proxies `/api/*` → `http://localhost:4000`. Start the backend separately.

### Option B — Docker Compose (full stack)
```bash
cd ledens
cp .env.example .env              # set CORS_ORIGIN=http://localhost:8080
docker compose up --build         # frontend on :8080, backend on :4000
```
This also starts a local PostgreSQL (`ledens-db`, published on `127.0.0.1:5432`, dev password in `docker-compose.yml`). To run only the database and use `npm run dev` for the backend:
```bash
cd ledens && docker compose up -d db
cd backend
DATABASE_URL=postgres://ledens:ledens_dev_password@localhost:5432/ledens npm run dev
DATABASE_URL=postgres://ledens:ledens_dev_password@localhost:5432/ledens npm test
```
(PowerShell: set `$env:DATABASE_URL = "..."` first.)

---

## Infra Scripts

| Script | When to use |
|---|---|
| `ledens/infra/setup.sh` | First-time provisioning of a new subscription. Builds the image, creates all Azure resources. |
| `ledens/infra/setup2.sh` | Recovery: re-creates `ledens-env` linked to the correct Log Analytics workspace without rebuilding the image. |

Both scripts auto-detect ACR name and login-server dynamically via `az acr list` — no hardcoded ACR URL.

---

## Key Design Decisions

1. **SWA Linked Backend** — `/api/*` is proxied by Azure SWA to the Container App. The frontend uses only relative paths (`/api/...`). No CORS is needed in production; CORS in the Express server only affects direct calls to the ACA FQDN.

2. **Managed Identity for ACR pull** — The Container App uses `id-ledens-api-acr-pull` (user-assigned managed identity) to pull images from ACR. No registry passwords or admin credentials are used anywhere.

3. **Azure Files for persistence** — Lead data (`leads.jsonl`) is appended to `/data` inside the container, which is mounted from the `ledens-data` Azure Files share. Data survives container restarts and new revisions.

4. **Clerk removed (issue #14)** — Auth is now entirely our own: backend sessions (see "Authentication") plus a thin frontend (`AuthContext`, `AuthPage`). No publishable key, no `@clerk/clerk-react`, no `/sso-callback` client-side step. Replaced because the project needed its own user database regardless (issues #8–#13), at which point a third-party identity SDK stopped pulling its weight.

5. **ACR login-server ≠ resource name** — The ACR resource name is `cregledensmvp1` but the login server is `cregledensmvp1-f0b3hcbabag9d3dp.azurecr.io`. Always use the full login-server URL for `az acr login` and Docker tags. Use the resource name for `az acr build`.

6. **Real database for users, not for leads (yet)** — User accounts live in PostgreSQL (see "Database"). Secrets such as `DATABASE_URL` must come from Key Vault / Container App secrets, never the repo or `VITE_*` variables.
