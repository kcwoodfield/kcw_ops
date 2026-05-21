# Auth Plan — Phase 5

**Goal:** Secure web-accessible deployment with username/password + TOTP 2FA. No third-party auth providers, no recurring cost beyond hosting.

---

## Approach: JWT + TOTP 2FA

### Login flow

```
1. POST /auth/login { username, password }
   → bcrypt verify → if valid, return { requiresMfa: true, tempToken (short-lived) }

2. POST /auth/verify { tempToken, totpCode }
   → validate 6-digit TOTP → return JWT access token + httpOnly refresh cookie

3. All API requests: Authorization: Bearer <jwt>
   → JWT expires in 15 min
   → Refresh token expires in 7 days (httpOnly cookie, POST /auth/refresh)

4. POST /auth/logout → clears refresh cookie
```

### Credential storage

Credentials live in **environment variables**, not the database. Single-user tool — no user management UI needed, nothing to brute-force from a DB dump.

```env
AUTH_USERNAME=kcw
AUTH_PASSWORD_HASH=<bcrypt hash>   # generated once at setup
AUTH_TOTP_SECRET=<base32 secret>   # generated once at setup, scan QR to enroll
JWT_SECRET=<random 256-bit key>
JWT_ISSUER=kcw-ops
```

### Setup flow (one-time)

A `POST /auth/setup` endpoint (dev-only or behind a setup flag) that:
1. Accepts a plain-text password → returns the bcrypt hash to put in `.env`
2. Generates a TOTP secret → returns a QR code URL to scan with an authenticator app

---

## Backend

### Packages to add

| Package | Purpose |
|---------|---------|
| `BCrypt.Net-Next` | Password hashing + verification |
| `System.IdentityModel.Tokens.Jwt` | JWT issuance + validation |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT middleware |
| `OtpNet` | TOTP generation + verification (RFC 6238) |

### New slices

```
api/Features/Auth/
├── Login/          POST /auth/login
├── Verify/         POST /auth/verify  (TOTP step)
├── Refresh/        POST /auth/refresh
├── Logout/         POST /auth/logout
└── Setup/          POST /auth/setup   (dev only)
```

### Middleware

- Add `[Authorize]` to all existing controllers
- Rate limiting on `/auth/*` endpoints (e.g. 5 attempts / 15 min per IP)
- CORS locked to `VITE_ORIGIN` env var (not `localhost:5175` hardcoded)

---

## Frontend

### New files

```
web/src/
├── pages/LoginPage.tsx        /login route
├── api/auth.ts                login/verify/refresh/logout hooks
└── lib/authGuard.tsx          redirect unauthenticated → /login
```

### Login page flow

1. Step 1: username + password form
2. Step 2: 6-digit TOTP code form (shown after step 1 succeeds)
3. On success: redirect to last project or `/`

### Route guard

Wrap all `/p/*` routes — if no valid JWT, redirect to `/login`. Check on app load and on 401 responses from the API.

### Env var

Replace hardcoded `http://localhost:5050/api` in `web/src/api/client.ts` with `import.meta.env.VITE_API_URL`.

---

## Security checklist

- [ ] HTTPS only (JWT over HTTP is useless — enforce at reverse proxy level)
- [ ] JWT signed with HS256, secret ≥ 256 bits
- [ ] bcrypt cost factor ≥ 12
- [ ] httpOnly + Secure + SameSite=Strict on refresh cookie
- [ ] Rate limiting on auth endpoints
- [ ] CORS locked to production origin
- [ ] TOTP window ±1 step (30s tolerance)
- [ ] Temp token (between login and TOTP verify) expires in 5 min

---

## Hosting cost

Everything is free open-source packages. Only cost is the server:

| Option | Cost | Notes |
|--------|------|-------|
| Railway / Render / Fly.io | ~$5–7/mo | Managed, easy deploy |
| DigitalOcean / Hetzner VPS | ~$4–6/mo | Full control |
| Self-hosted | $0 | Not web-accessible |

---

## Effort estimate

~1 day of focused work once started.
