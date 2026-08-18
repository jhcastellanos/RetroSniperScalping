# Scalping Challenge

PWA para administrar retos comunitarios de crecimiento de cuentas mediante scalping.

Flujo: **Register → Join Challenge → Waiting → Admin Starts → Daily Balance → Leaderboard → Progress → Complete Challenge.**

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Neon PostgreSQL + Prisma
- Auth.js (Google OAuth + email/password)
- Vercel Blob para fotos de perfil en producción
- PWA (manifest + service worker)

## 1. Neon PostgreSQL

1. Entra a [https://console.neon.tech](https://console.neon.tech) y crea una cuenta.
2. **New Project**.
3. Nombre: `scalping-challenge`.
4. Región recomendada: **AWS US East (Ohio)** `us-east-1` si tus usuarios están en América. Elige la más cercana.
5. Postgres version: la última estable (15+).
6. Crea el proyecto. Neon crea una database `neondb` por defecto.
7. En **Dashboard → Connection Details**:
   - Copia la connection string **pooled** (aparece `*-pooler.` en el host). Esa es `DATABASE_URL`.
   - Cambia a **direct** (sin pooler). Esa es `DIRECT_URL`. Prisma la usa para migrations.
8. Colócalas en `.env.local` (nunca las subas a GitHub):

```env
DATABASE_URL="postgresql://...@ep-xxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://...@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

9. Ejecuta migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

10. Comprueba la conexión:

```bash
npx prisma studio
```

11. En Neon, **Tables** muestra `User`, `Challenge`, `ChallengeParticipant`, `DailyBalance`, `Account`, `Session`.

No publiques estas URLs. Quien las tenga puede leer y escribir toda la base.

## 2. AUTH_SECRET

Ya puedes generar uno:

```bash
openssl rand -base64 32
```

Colócalo en `.env.local` como `AUTH_SECRET`. No lo compartas.

`AUTH_URL` en local: `http://localhost:3000`

## 3. Google OAuth

1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto, por ejemplo `scalping-challenge`.
3. **APIs & Services → OAuth consent screen**.
4. User type: **External**.
5. App name: `Scalping Challenge`. Email de soporte: el tuyo.
6. Scopes: deja los básicos (`email`, `profile`, `openid`).
7. Test users: agrega tu Gmail mientras la app esté en Testing.
8. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
9. Application type: **Web application**.
10. Authorized JavaScript origins:
    - `http://localhost:3000`
    - `https://tu-dominio.vercel.app`
11. Authorized redirect URIs:
    - `http://localhost:3000/api/auth/callback/google`
    - `https://tu-dominio.vercel.app/api/auth/callback/google`
12. Copia **Client ID** → `GOOGLE_CLIENT_ID`
13. Copia **Client Secret** → `GOOGLE_CLIENT_SECRET`

No publiques el Client Secret.

Sin estas variables, el registro con email/password sigue funcionando y el botón de Google se oculta.

## 4. Fotos de perfil (Vercel Blob)

En local, las fotos se guardan en `public/uploads` y no necesitas un proveedor.

En producción con Vercel:

1. Entra a [Vercel Dashboard](https://vercel.com/dashboard) → tu proyecto → **Storage**.
2. Create Database → **Blob**.
3. Copia `BLOB_READ_WRITE_TOKEN`.
4. Añádela en Vercel Environment Variables y en `.env.local` si quieres probar Blob en local.

Plan gratuito de Blob es suficiente para el MVP. No guardamos binarios en Neon.

Si el usuario quita su foto personalizada, se usa el avatar de Google (si existe) o `/images/default-avatar.svg`. Reemplaza ese archivo cuando tengas tu imagen definitiva. Si usas PNG, cambia la constante `DEFAULT_PROFILE_IMAGE` en `src/lib/constants.ts`.

## 5. Desarrollo local

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Abre `http://localhost:3000`.

## 6. Promover un usuario a ADMIN

No existe `admin/admin` ni un rol hardcodeado.

1. Crea tu cuenta en la app.
2. Ejecuta:

```bash
npx tsx scripts/promote-admin.ts tu-correo@ejemplo.com
```

O cambia `role` a `ADMIN` en la tabla `User` desde Neon.

Cierra sesión y vuelve a entrar para refrescar el JWT.

## Scripts

- `npm run dev` — servidor local
- `npm run build` — build de producción
- `npx prisma studio` — inspeccionar datos
- `npx tsx scripts/promote-admin.ts email` — promover admin
